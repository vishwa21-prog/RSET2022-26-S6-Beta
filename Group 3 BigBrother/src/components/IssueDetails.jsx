import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import Confetti from "react-confetti";

export default function IssueDetails() {
  const location = useLocation();
  const issue = location.state;
  const [upvotes, setUpvotes] = useState(issue.upvotes);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const replyBoxRef = useRef(null);

  useEffect(() => {
    fetchComments();

    // Check if user has already upvoted
    const upvotedIssues = JSON.parse(localStorage.getItem("upvotedIssues")) || [];
    if (upvotedIssues.includes(issue.id)) {
      console.log("User has already upvoted this issue");
    }

    // Fetch issue image from Supabase storage bucket
    const fetchImage = async () => {
      if (issue.image_url) {
        const { data } = supabase.storage
          .from("issue-images") // Bucket name
          .getPublicUrl(issue.image_url);
        setImageUrl(data.publicUrl);
      }
    };

    fetchImage();

    // Close reply box when clicking outside
    const handleClickOutside = (event) => {
      if (replyBoxRef.current && !replyBoxRef.current.contains(event.target)) {
        setReplyingTo(null);
        setReplyText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [issue.id, issue.image_url]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: true });

    if (!error) {
      setComments(buildCommentTree(data));
    }
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    comments.forEach(comment => commentMap[comment.id] = { ...comment, replies: [] });

    const rootComments = [];
    comments.forEach(comment => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleUpvote = async () => {
    const upvotedIssues = JSON.parse(localStorage.getItem("upvotedIssues")) || [];
    if (upvotedIssues.includes(issue.id)) {
      alert("You have already upvoted this issue!");
      return;
    }
    const { error } = await supabase.from("issues").update({ upvotes: upvotes + 1 }).eq("id", issue.id);
    if (!error) {
      setUpvotes(upvotes + 1);
      localStorage.setItem("upvotedIssues", JSON.stringify([...upvotedIssues, issue.id]));
    }
  };

  const handleAddComment = async (parentId = null) => {
    const text = parentId ? replyText : newComment;
    if (text.trim() === "") return;

    const { error } = await supabase.from("comments").insert([
      { issue_id: issue.id, content: text, parent_id: parentId }
    ]);

    if (!error) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setReplyingTo(null);
      setReplyText("");
      setNewComment("");
      fetchComments();
    }
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`ml-${depth * 4} mt-2 p-3 bg-white rounded-lg shadow-md`}>
        <p className="text-gray-900">{comment.content}</p>

        <button
          className="text-blue-500 text-sm mt-1"
          onClick={() => setReplyingTo(comment.id)}
        >
          Reply
        </button>

        {replyingTo === comment.id && (
          <div ref={replyBoxRef} className="mt-2 flex flex-col gap-2 ml-6">
            <input
              type="text"
              placeholder="Write a reply..."
              className="p-2 border rounded-lg w-full"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              onClick={() => handleAddComment(comment.id)}
            >
              Post Reply
            </button>
          </div>
        )}

        {comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-gradient-to-br from-teal-200 to-orange-100 text-gray-900 p-6 overflow-auto">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={100} />}
      <div className="w-full max-w-3xl bg-white bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-3xl font-bold text-teal-700">{issue.title}</h1>
        <p className="text-gray-700 mt-2">{issue.description}</p>

        {/* Display Image if Available */}
        {imageUrl && (
          <img src={imageUrl} alt="Issue" className="w-full h-auto rounded-lg mt-4" />
        )}

        <div className="flex items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transform active:scale-90 transition duration-150"
            onClick={handleUpvote}
          >
            Upvote 🔼 {upvotes}
          </button>
        </div>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800">Comments</h2>
        <div className="mt-3 space-y-4">
          {renderComments(comments)}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="p-3 border rounded-lg w-full"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform active:scale-95 transition duration-150"
            onClick={() => handleAddComment()}
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
