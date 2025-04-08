import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Ensure supabase is correctly set up

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session) {
        navigate("/login"); // Redirect to login if not logged in
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);

      // Fetch issues reported by this user
      const { data: userIssues, error } = await supabase
        .from("issues")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user issues:", error.message);
      } else {
        setIssues(userIssues);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Function to delete an issue
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    const { error } = await supabase.from("issues").delete().eq("id", issueId);
    if (error) {
      console.error("Error deleting issue:", error.message);
    } else {
      setIssues(issues.filter((issue) => issue.id !== issueId));
    }
  };

  if (!user) return null; // Prevent rendering before user data is loaded

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-200 to-green-200 flex flex-col items-center p-6">
      {/* Profile Card */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">👤 {user.email.split("@")[0]}</h2>

        <p className="text-gray-600 mt-2">Your Profile</p>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/user-login"); // Redirect to login page
          }}
        >
          Logout
        </button>
      </div>

      {/* User Issues Section */}
      <div className="w-full max-w-3xl mt-6 bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800">📌 Your Issues</h3>
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 mt-4 border rounded-lg shadow-md bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
            >
              <div>
                <h4 className="text-xl font-semibold text-gray-700">{issue.title}</h4>
                <p className="text-gray-600">{issue.description}</p>
                <p className="text-sm text-gray-500">📍 {issue.location}</p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                onClick={() => handleDeleteIssue(issue.id)}
              >
                🗑 Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center mt-4">No issues reported yet.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
