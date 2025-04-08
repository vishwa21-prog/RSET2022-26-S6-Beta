import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import OrganizerFooter from "./OrganizerFooter";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrganizerProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email_id: "",
    phone_number: "",
    is_verified: false,
    fee_payment: "",
  });

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Authentication error:", authError?.message);
        setLoading(false);
        return;
      }

      const userEmail = authData.user.email.toLowerCase();
      
      const { data, error: profileError } = await supabase
        .from("organizers")
        .select("id, name, email_id, phone_number, is_verified, fee_payment")
        .ilike("email_id", userEmail)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("organizers")
      .update({
        name: profile.name,
        phone_number: profile.phone_number,
        fee_payment: profile.fee_payment,
      })
      .eq("id", profile.id);

    if (!error) {
      setEditMode(false);
      alert("Profile updated successfully!");
    } else {
      alert("Error updating profile.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/home");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-900 text-white shadow-md rounded-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md"
      >
        ← Back
      </button>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Organizer Profile</h1>
        <button onClick={() => setEditMode(!editMode)} className="text-green-400 hover:text-green-500">
          <FaEdit size={24} />
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full p-2 border rounded-md bg-gray-800 text-white disabled:opacity-50"
          placeholder="Name"
        />
        <input
          type="email"
          name="email_id"
          value={profile.email_id}
          disabled
          className="w-full p-2 border rounded-md bg-gray-700 text-gray-400"
        />
        <input
          type="text"
          name="phone_number"
          value={profile.phone_number}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full p-2 border rounded-md bg-gray-800 text-white disabled:opacity-50"
          placeholder="Phone Number"
        />
      
      </div>

      {editMode && (
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md w-full"
      >
        Logout
      </button>
      
      <OrganizerFooter />
    </div>
  );
};

export default OrganizerProfile;