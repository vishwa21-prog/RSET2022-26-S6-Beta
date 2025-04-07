import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase";

export default function AuthorityIssueDetails() {
  const location = useLocation();
  const issue = location.state;
  const [comments, setComments] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    fetchComments();
    fetchImage();
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

  const fetchImage = async () => {
    if (issue.image_url) {
      const { data } = supabase.storage.from("issue-images").getPublicUrl(issue.image_url);
      setImageUrl(data.publicUrl);
    }
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    comments.forEach((comment) => (commentMap[comment.id] = { ...comment, replies: [] }));

    const rootComments = [];
    comments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id]?.replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.id} className={`ml-${depth * 4} mt-2 p-3 bg-white rounded-lg shadow-md`}>
        <p className="text-gray-900">{comment.content}</p>

        {/* Render replies recursively */}
        {comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-gradient-to-br from-teal-200 to-orange-100 text-gray-900 p-6 overflow-auto">
      <div className="w-full max-w-3xl bg-white bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-md">
        <h1 className="text-3xl font-bold text-teal-700">{issue.title}</h1>
        <p className="text-gray-700 mt-2">{issue.description}</p>
        
        {imageUrl && (
          <img src={imageUrl} alt="Issue" className="w-full h-auto rounded-lg mt-4" />
        )}
        
        <div className="flex items-center mt-4">
          <p className="text-lg font-semibold text-gray-800">👍 Upvotes: {issue.upvotes}</p>
        </div>

        <h2 className="text-2xl font-semibold mt-6 text-gray-800">Comments</h2>
        <div className="mt-3 space-y-4">
          {comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <p className="text-gray-600">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
