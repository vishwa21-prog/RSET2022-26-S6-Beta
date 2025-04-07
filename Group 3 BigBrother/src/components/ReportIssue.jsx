import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import confetti from "canvas-confetti";
import MapComponent from "./MapComponent";
import { analyzeText } from "../perspective";

export default function ReportIssue() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [issue, setIssue] = useState({
    title: "",
    description: "",
    severity: "Severity",
    category: "",
    location: "",
    image: null,
    authority_id: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUserId(data?.user?.id || null);
      }
    };

    const fetchAuthorities = async () => {
      const { data, error } = await supabase
        .from("authorities")
        .select("id, name")
        .eq("approved", true);

      if (error) {
        console.error("Error fetching authorities:", error.message);
      } else {
        setAuthorities(data || []);
      }
    };

    fetchUser();
    fetchAuthorities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "authority_id") {
      const selectedAuth = authorities.find((auth) => auth.id.toString() === value);
      setSelectedAuthority(selectedAuth ? selectedAuth.name : "No Authority Found");
      setIssue({ ...issue, authority_id: value });
    } else {
      setIssue({ ...issue, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    setIssue({ ...issue, image: e.target.files[0] });
  };

  const handleLocationSelect = (selectedLocation) => {
    setIssue({ ...issue, location: selectedLocation });
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const filePath = `public/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("issue-images").upload(filePath, file);

    if (error) {
      console.error("Image upload failed:", error.message);
      alert("Image upload failed! Please try again.");
      return null;
    }

    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to submit an issue.");
      return;
    }

    try {
      const titleScore = await analyzeText(issue.title);
      const descriptionScore = await analyzeText(issue.description);

      if (titleScore > 0.8 || descriptionScore > 0.8) {
        alert("Your issue contains inappropriate content. Please revise.");
        return;
      }
    } catch (err) {
      console.error("Error analyzing content:", err.message);
      alert("Error analyzing content. Please try again later.");
      return;
    }

    try {
      let imageUrl = null;
      if (issue.image) {
        imageUrl = await uploadImage(issue.image);
        if (!imageUrl) {
          alert("Image upload failed. Please try again.");
          return;
        }
      }

      const { data, error } = await supabase.from("issues").insert([
        {
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
          category: issue.category,
          authority_id: issue.authority_id,
          location: issue.location,
          image_url: imageUrl || null,
          user_id: userId,
          status: "Open",
        },
      ]);

      if (error) throw error;

      // ✅ Confetti only after successful submission
      confetti({
        particleCount: 150,
        spread: 120,
        startVelocity: 40,
        scalar: 1.2,
        origin: { x: 0.5, y: 0.5 },
      });

      // ✅ Navigate only after successful submission
      setTimeout(() => navigate("/user-feed"), 2000);
    } catch (err) {
      console.error("Error submitting issue:", err.message);
      alert("Error submitting issue: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-screen bg-gradient-to-br from-pink-300 to-sky-300 text-white p-6">
      <div className="w-full max-w-3xl bg-white bg-opacity-10 p-8 rounded-xl shadow-2xl backdrop-blur-md text-center">
        <h2 className="text-4xl font-extrabold mb-6">Report a New Issue</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            value={issue.title}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <textarea
            name="description"
            placeholder="Describe the issue..."
            value={issue.description}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
            required
          />

          <select
            name="severity"
            value={issue.severity}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Severity" disabled>Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            name="category"
            value={issue.category}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="" disabled>Select Category</option>
            <option value="Road">Road</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water">Water</option>
          </select>

          <select
            name="authority_id"
            value={issue.authority_id || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="" disabled>Select Authority</option>
            {authorities.map((auth) => (
              <option key={auth.id} value={auth.id}>{auth.name}</option>
            ))}
          </select>

          {/* Location Input Restored */}
          <input
            type="text"
            name="location"
            placeholder="Enter address or coordinates"
            value={issue.location}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <MapComponent setLocation={handleLocationSelect} />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition hover:scale-105">
            Submit Issue
          </button>

          <button onClick={() => navigate("/user-feed")} className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transition hover:scale-105">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
