import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function UserFeed() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y");

  useEffect(() => {
    // Fetch logged-in user details
    const fetchUser = async () => {
      const { data: authUser, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (authUser?.user) {
        setUser(authUser.user);

        // Fetch the name & avatar from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", authUser.user.id)
          .single();

        if (userError) console.error("Error fetching user data:", userError.message);
        else {
          setUserName(userData?.name || "User");
          setUserAvatar(userData?.avatar_url || "/default-avatar.png");
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      let query = supabase.from("issues").select("*");

      if (sortBy === "Newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "Most Upvoted") {
        query = query.order("upvotes", { ascending: false });
      }

      if (searchQuery.trim() !== "") {
        query = query.textSearch("title,description", searchQuery, {
          type: "websearch",
        });
      }

      const { data, error } = await query;
      if (error) console.error("Error fetching issues:", error.message);
      else {
        const issuesWithCommentCounts = await Promise.all(
          data.map(async (issue) => {
            const { count } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("issue_id", issue.id)
              .is("parent_id", null);
            return { ...issue, commentCount: count || 0 };
          })
        );
        setIssues(issuesWithCommentCounts);
      }
    };

    fetchIssues();
  }, [sortBy, searchQuery]);

  useEffect(() => {
    if (!user) return;
  
    console.log("🔄 Subscribing to real-time updates...");
  
    const subscription = supabase
      .channel("realtime:issues")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "issues" },
        (payload) => {
          console.log("📩 Received real-time update:", payload);
  
          const updatedIssue = payload.new;
          const previousIssue = payload.old;
  
          // 🔹 Ensure only status changes trigger an alert
          if (updatedIssue.status !== previousIssue.status) {
            // 🔹 Filter based on user_id (notify only the issue reporter)
            if (updatedIssue.user_id === user.id) {
              alert(`🚨 Issue "${updatedIssue.title}" status changed to "${updatedIssue.status}"`);
            }
  
            // 🔹 OR filter based on authority_id (notify only relevant authorities)
            if (updatedIssue.authority_id && updatedIssue.authority_id === user.id) {
              alert(`⚠️ Attention! Issue "${updatedIssue.title}" needs review. New status: "${updatedIssue.status}"`);
            }
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
      console.log("🚫 Unsubscribed from real-time updates.");
    };
  }, [user]);
  
  


  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-200";
      case "Medium":
        return "bg-yellow-200";
      case "Low":
        return "bg-green-200";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-gradient-to-br from-green-200 to-pink-200 text-gray-900 p-6 overflow-auto">
      
      {/* User Profile Box - Fixed Position */}
      {user && (
        <div className="fixed top-6 right-6 flex flex-col items-center p-4 bg-white shadow-md rounded-lg z-50">
          <div
            className="cursor-pointer flex items-center space-x-3 p-3 hover:bg-gray-100 transition rounded-lg"
            onClick={() => navigate("/user-profile")}
          >
            <img
              src={userAvatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border border-gray-300"
            />
            <div>
            <p className="font-semibold text-lg">{user ? user.email.split("@")[0] : "User"}</p>

              <p className="text-sm text-gray-600">View Profile →</p>
            </div>
          </div>

          {/* Logout Button Below Profile */}
          <button
            className="mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            onClick={() => {
              supabase.auth.signOut();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      )}

<h1 className="text-4xl font-bold mb-6 text-gray-800">  Hello {user ? user.email.split("@")[0] : "!"}</h1>

      <p className="text-lg mb-6 text-gray-600 font-semibold">
        Explore and upvote issues reported by the community.
      </p>

      {/* Search and Sorting Controls */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search issues..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="relative w-full md:w-1/3">
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 transition appearance-none"
          >
            <option value="Newest">📅 Newest</option>
            <option value="Most Upvoted">🔥 Most Upvoted</option>
          </select>
          <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">▼</div>
        </div>
      </div>

      {/* Issue Cards */}
      <div className="w-full max-w-3xl bg-white bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-md">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-opacity-70 transition ${getSeverityColor(issue.severity)}`}
              onClick={() => navigate(`/issue/${issue.id}`, { state: issue })}
            >
              <h2 className="text-2xl font-semibold text-black-600">{issue.title}</h2>
              <p className="text-gray-700">{issue.description}</p>
              <p className="text-sm text-gray-500">📍 {issue.location}</p>

              <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mt-2">
                <p>⚠️ Severity: <span className="font-bold">{issue.severity}</span></p>
                <p>📌 Category: <span className="font-bold">{issue.category}</span></p>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mt-2">
                <p>👍 {issue.upvotes} Upvotes</p>
                <p>💬 {issue.commentCount} Comments</p>
              </div>

              <p className={`text-sm font-semibold mt-2 ${
                issue.status === "Resolved" ? "text-green-600" :
                issue.status === "In Progress" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                ⚡ {issue.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">No issues found.</p>
        )}
      </div>

      {/* Report New Issue Button */}
      <button
        onClick={() => navigate("/report-issue")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition hover:scale-110"
      >
        + Report Issue
      </button>
    </div>
  );
}
