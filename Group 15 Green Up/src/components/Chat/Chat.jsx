import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "./../user/Footer/Footer";

const Chat = () => {
  const { organizerId, eventId, attendeeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("User not authenticated:", authError?.message);
        return;
      }

      const userEmail = authData.user.email;

      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (participantData && !participantError) {
        setCurrentUserRole("attendee");
        setCurrentUserId(participantData.id);
        return;
      }

      const { data: organizerData, error: organizerError } = await supabase
        .from("organizers")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (organizerData && !organizerError) {
        setCurrentUserRole("organizer");
        setCurrentUserId(organizerData.id);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchEventName = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("title")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEventName(data?.title || "Unknown Event");
      } catch (error) {
        console.error("Error fetching event name:", error.message);
        setEventName("Unknown Event");
      }
    };

    fetchEventName();
  }, [eventId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!eventId || !attendeeId || !organizerId) return;

      setLoading(true);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select(`
            id,
            event_id,
            attendee_id,
            message,
            created_at,
            sent_by,
            organizer_id
          `)
          .eq("event_id", eventId)
          .eq("attendee_id", attendeeId)
          .eq("organizer_id", organizerId)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        const attendeeIds = [
          ...new Set(messagesData.filter((msg) => msg.sent_by).map((msg) => msg.attendee_id).filter((id) => id)),
        ];
        const organizerIds = [
          ...new Set(messagesData.filter((msg) => !msg.sent_by).map((msg) => msg.organizer_id).filter((id) => id)),
        ];

        let participantsData = [];
        let organizersData = [];

        if (attendeeIds.length > 0) {
          const { data, error: participantsError } = await supabase
            .from("participants")
            .select("id, name")
            .in("id", attendeeIds);
          if (participantsError) throw participantsError;
          participantsData = data || [];
        }

        if (organizerIds.length > 0) {
          const { data, error: organizersError } = await supabase
            .from("organizers")
            .select("id, name")
            .in("id", organizerIds);
          if (organizersError) throw organizersError;
          organizersData = data || [];
        }

        const messagesWithNames = messagesData.map((message) => {
          let name = "Unknown";
          if (message.sent_by) {
            const participant = participantsData.find((p) => p.id === message.attendee_id);
            name = participant?.name || "Unknown";
          } else {
            const organizer = organizersData.find((o) => o.id === message.organizer_id);
            name = organizer?.name || "Unknown";
          }
          return { ...message, name };
        });

        setMessages(messagesWithNames);
      } catch (error) {
        console.error("Error in fetchMessages:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [eventId, attendeeId, organizerId]);

  useEffect(() => {
    if (!eventId || !attendeeId || !organizerId) return;

    const messageSubscription = supabase
      .channel(`messages:${eventId}:${attendeeId}:${organizerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const newMessage = payload.new;

          if (
            newMessage.event_id !== eventId ||
            newMessage.attendee_id !== attendeeId ||
            newMessage.organizer_id !== organizerId
          ) {
            return;
          }

          let senderName = "Unknown";
          if (newMessage.sent_by) {
            const { data: attendee, error: attendeeError } = await supabase
              .from("participants")
              .select("name")
              .eq("id", newMessage.attendee_id)
              .single();
            if (attendeeError) console.error("Error fetching attendee name:", attendeeError.message);
            senderName = attendee?.name || "Unknown Attendee";
          } else {
            const { data: organizer, error: organizerError } = await supabase
              .from("organizers")
              .select("name")
              .eq("id", newMessage.organizer_id)
              .single();
            if (organizerError) console.error("Error fetching organizer name:", organizerError.message);
            senderName = organizer?.name || "Unknown Organizer";
          }

          setMessages((prevMessages) => {
            if (prevMessages.some((msg) => msg.id === newMessage.id)) return prevMessages;
            return [...prevMessages, { ...newMessage, name: senderName }];
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [eventId, attendeeId, organizerId]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!messageInput.trim() || !currentUserId || !currentUserRole) return;

    try {
      const newMessage = {
        event_id: eventId,
        message: messageInput,
        sent_by: currentUserRole === "attendee",
      };
      if (currentUserRole === "attendee") {
        newMessage.attendee_id = currentUserId;
        newMessage.organizer_id = organizerId;
      } else {
        newMessage.organizer_id = currentUserId;
        newMessage.attendee_id = attendeeId;
      }

      const { error: insertError } = await supabase
        .from("messages")
        .insert([newMessage]);

      if (insertError) throw insertError;

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <button
        onClick={() => navigate(`/afterregistration/${eventId}/${attendeeId}`)}
        style={{ position: "fixed", top: "0px", right: "0px", zIndex: 1000 }}
        className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Back
      </button>

      <div className="chat-container" style={{ minHeight: "200px", padding: "20px" }}>
        <h2>Chat for {eventName}</h2>

        <div id="messages-container" className="messages-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            <div className="messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="message"
                    style={{
                      textAlign:
                        (message.sent_by && message.attendee_id === currentUserId) ||
                        (!message.sent_by && message.organizer_id === currentUserId)
                          ? "right"
                          : "left",
                      color:
                        (message.sent_by && message.attendee_id === currentUserId) ||
                        (!message.sent_by && message.organizer_id === currentUserId)
                          ? "blue"
                          : "inherit",
                    }}
                  >
                    <p>
                      <strong>{message.name || "Unknown"}:</strong> {message.message}
                    </p>
                    <small>{new Date(message.created_at).toLocaleString()}</small>
                  </div>
                ))
              ) : (
                <p>No messages yet. Be the first to send a message!</p>
              )}
            </div>
          )}
        </div>

        <div className="message-input-container">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Type a message..."
          />
          <button
            className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            onClick={handleSendMessage}
            >
            Send
          </button>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Chat;