import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerFooter from "./OrganizerFooter";

const OrganizerChat = () => {
  const { eventId, attendeeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [organizerId, setOrganizerId] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchOrganizerId = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("User not authenticated:", authError?.message);
        return;
      }

      const userEmail = authData.user.email;
      const { data: organizer, error: organizerError } = await supabase
        .from("organizers")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (organizerError || !organizer) {
        console.error("Organizer not found:", organizerError?.message);
        return;
      }

      setOrganizerId(organizer.id);
    };

    fetchOrganizerId();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!organizerId || !eventId || !attendeeId) return;

      setLoading(true);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("event_id", eventId)
          .eq("attendee_id", attendeeId)
          .eq("organizer_id", organizerId)
          .order("created_at", { ascending: true });

        if (messagesError) throw new Error("Error fetching messages: " + messagesError.message);

        if (!messagesData.length) {
          setMessages([]);
          return;
        }

        const attendeeIds = [...new Set(messagesData.filter((msg) => msg.sent_by).map((msg) => msg.attendee_id))];
        const organizerIds = [...new Set(messagesData.filter((msg) => !msg.sent_by).map((msg) => msg.organizer_id))];

        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("id, name")
          .in("id", attendeeIds);
        if (participantsError) console.error("Error fetching participants:", participantsError.message);

        const { data: organizersData, error: organizersError } = await supabase
          .from("organizers")
          .select("id, name")
          .in("id", organizerIds);
        if (organizersError) console.error("Error fetching organizers:", organizersError.message);

        const messagesWithNames = messagesData.map((message) => {
          if (message.sent_by) {
            const participant = participantsData?.find((p) => p.id === message.attendee_id);
            return { ...message, senderName: participant?.name || "Unknown Attendee" };
          } else {
            const organizer = organizersData?.find((o) => o.id === message.organizer_id);
            return { ...message, senderName: organizer?.name || "Unknown Organizer" };
          }
        });

        setMessages(messagesWithNames);
      } catch (error) {
        console.error("Error in fetchMessages:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [organizerId, eventId, attendeeId]);

  useEffect(() => {
    if (!eventId || !organizerId || !attendeeId) return;

    const channel = supabase
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
            const { data: attendee, error } = await supabase
              .from("participants")
              .select("name")
              .eq("id", newMessage.attendee_id)
              .single();
            if (error) console.error("Error fetching attendee name:", error.message);
            senderName = attendee?.name || "Unknown Attendee";
          } else {
            const { data: organizer, error } = await supabase
              .from("organizers")
              .select("name")
              .eq("id", newMessage.organizer_id)
              .single();
            if (error) console.error("Error fetching organizer name:", error.message);
            senderName = organizer?.name || "Unknown Organizer";
          }

          setMessages((prevMessages) => {
            if (prevMessages.some((msg) => msg.id === newMessage.id)) return prevMessages;
            return [...prevMessages, { ...newMessage, senderName }];
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, organizerId, attendeeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !organizerId) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      event_id: eventId,
      attendee_id: attendeeId,
      organizer_id: organizerId,
      message: messageInput,
      sent_by: false,
      created_at: new Date().toISOString(),
      id: tempId,
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      { ...newMessage, senderName: "You" },
    ]);
    setMessageInput("");

    const { data, error } = await supabase
      .from("messages")
      .insert([{ event_id: eventId, attendee_id: attendeeId, organizer_id: organizerId, message: messageInput, sent_by: false }])
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error.message);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== tempId));
    } else if (data) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempId ? { ...data, senderName: "You" } : msg))
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && messageInput.trim()) {
      handleSendMessage();
    }
  };

  const handleNavigateBack = () => {
    navigate(`/organizer/event/${eventId}/chat`);
  };

  return (
    <div className="chat-container">
      <button
        onClick={handleNavigateBack}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Chat List
      </button>

      <h2>Chat with Attendee</h2>

      <div
        id="messages-container"
        className="messages-container"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          <div className="messages">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message mb-2 ${message.sent_by === false && message.organizer_id === organizerId ? "text-right text-blue-500" : "text-left text-gray-700"}`}
                >
                  <p>
                    <strong>{message.senderName}:</strong> {message.message}
                  </p>
                  <small>{new Date(message.created_at).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
        )}
      </div>

      <div className="message-input-container mt-4">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="p-2 border rounded-l-md w-full"
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className={`px-4 py-2 bg-green-600 text-white rounded-r-md transition ${!messageInput.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
        >
          Send
        </button>
      </div>
      <OrganizerFooter />
    </div>
  );
};

export default OrganizerChat;