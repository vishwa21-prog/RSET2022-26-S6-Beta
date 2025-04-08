import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Ensure supabase.js is correctly configured

export default function AuthorityFeed() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loadingIssue, setLoadingIssue] = useState(null);
  const [sortOption, setSortOption] = useState("newest"); // Default sorting: Newest
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [authorityId, setAuthorityId] = useState(null);

  useEffect(() => {
    const authorityId = localStorage.getItem("authority_id");
    if (!authorityId) {
      navigate("/authority-login"); // Redirect to login if not found
    } else {
      fetchIssues();
    }
  }, []);

  useEffect(() => {
    fetchAuthority();
  }, []);

  const fetchAuthority = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching authority user:", userError.message);
      return;
    }

    const userId = userData?.user?.id;
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const { data: authorityData, error: authorityError } = await supabase
      .from("authorities")
      .select("id")
      .eq("id", userId)
      .single();

    if (authorityError) {
      console.error("Error fetching authority details:", authorityError.message);
      return;
    }

    setAuthorityId(authorityData.id);
    fetchIssues(authorityData.id);
  };

  const fetchIssues = async () => {
    const authorityId = localStorage.getItem("authority_id");
    if (!authorityId) {
      console.error("No authority logged in");
      return;
    }

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("authority_id", authorityId); // Filter by authority

    if (error) {
      console.error("Error fetching issues:", error.message);
    } else {
      // Fetch comments count for each issue
      const updatedIssues = await Promise.all(
        data.map(async (issue) => {
          const { count, error: commentError } = await supabase
            .from("comments")
            .select("id", { count: "exact" })
            .eq("issue_id", issue.id);

          if (commentError) {
            console.error("Error fetching comments:", commentError.message);
          }

          return { ...issue, commentCount: count || 0 };
        })
      );

      setIssues(updatedIssues);
    }
  };

  const updateStatus = async (event, issueId, newStatus) => {
    event.stopPropagation(); // Prevent redirection to issue details

    setLoadingIssue(issueId);
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issueId);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      await fetchIssues(authorityId);
    }

    setLoadingIssue(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-500";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-500";
      case "Cannot be Resolved":
        return "bg-red-100 text-red-700 border-red-500";
      default:
        return "bg-gray-100 text-gray-700 border-gray-500";
    }
  };

  // Function to determine issue card color based on severity
  const getPriorityClass = (severity) => {
    switch (severity) {
      case "High":
        return "bg-red-100 border-l-4 border-red-500"; // High priority - Red
      case "Medium":
        return "bg-yellow-100 border-l-4 border-yellow-500"; // Medium priority - Yellow
      case "Low":
        return "bg-green-100 border-l-4 border-green-500"; // Low priority - Green
      default:
        return "bg-gray-100 border-l-4 border-gray-500"; // Default (if no priority set)
    }
  };

  // Filtering and Sorting
  const filteredIssues = issues
    .filter((issue) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((issue) => (statusFilter === "all" ? true : issue.status === statusFilter))
    .sort((a, b) => {
      if (sortOption === "upvotes") {
        return b.upvotes - a.upvotes; // Sort by highest upvotes
      } else {
        return new Date(b.created_at) - new Date(a.created_at); // Sort by newest first
      }
    });

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-200 to-yellow-100 text-gray-900 p-6 overflow-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Authority Dashboard</h1>
      <p className="text-lg mb-6 text-gray-600 font-semibold">
        Manage and update the status of reported issues.
      </p>

      {/* Search and Filter Options */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by Title or Location"
          className="px-3 py-2 border rounded-md bg-white shadow-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="px-3 py-2 border rounded-md bg-white shadow-md cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Resolved">Resolved</option>
          <option value="In Progress">In Progress</option>
          <option value="Cannot be Resolved">Cannot be Resolved</option>
        </select>

        <select
          className="px-3 py-2 border rounded-md bg-white shadow-md cursor-pointer"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="newest">Newest to Oldest</option>
          <option value="upvotes">Most Upvotes</option>
        </select>
      </div>

      {/* Issue Cards */}
      <div className="w-full max-w-3xl bg-white bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-md">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-opacity-70 transition ${getPriorityClass(issue.severity)}`}
              onClick={() => navigate(`/authority-issue/${issue.id}`, { state: issue })}
            >
              <h2 className="text-2xl font-semibold text-teal-600">{issue.title}</h2>
              <p className="text-gray-700">{issue.description}</p>
              <p className="text-sm text-gray-500">📍 {issue.location}</p>

              {/* Upvotes and Comment Count */}
              <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                <p>👍 {issue.upvotes} Upvotes</p>
                <p>💬 {issue.commentCount || 0} Comments</p>
              </div>

              {/* Status Display */}
              <p className={`mt-2 px-3 py-1 inline-block border rounded-md font-semibold ${getStatusClass(issue.status)}`}>
                ⚡ Status: {issue.status}
              </p>
              {/* Status Update Buttons */}
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700" onClick={(event) => updateStatus(event, issue.id, "Resolved")} disabled={issue.status === "Resolved" || loadingIssue === issue.id}>
                  {loadingIssue === issue.id ? "Updating..." : "Mark as Resolved"}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${issue.status === "In Progress" ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
                  onClick={(event) => updateStatus(event, issue.id, "In Progress")}
                  disabled={issue.status === "In Progress" || loadingIssue === issue.id}
                >
                  {loadingIssue === issue.id ? "Updating..." : "Mark as In Progress"}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${issue.status === "Cannot be Resolved" ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={(event) => updateStatus(event, issue.id, "Cannot be Resolved")}
                  disabled={issue.status === "Cannot be Resolved" || loadingIssue === issue.id}
                >
                  {loadingIssue === issue.id ? "Updating..." : "Mark as Cannot be Resolved"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">No issues found.</p>
        )}
      </div>
    </div>
  );
}
