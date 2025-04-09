import React, { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient.jsx";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");

      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser?.user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const userId = authUser.user.id;

      // Fetch user details including reward_points from participants table
      const { data: userData, error: userError } = await supabase
        .from("participants")
        .select("id, name, email_id, phone_number, reward_points")
        .eq("id", userId)
        .single();

      if (userError) {
        setError("Failed to fetch user data.");
        setLoading(false);
        return;
      }

      setUser({ id: userId, ...userData });
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/home");
    window.location.reload();
  };

  // Navigate to Reward Points Page with attendee_id
  const handlePointsClick = () => {
    if (user?.id) {
      navigate(`/rewardpoints/${user.id}`);
    } else {
      console.error("User ID is undefined!");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#1E1E1E] text-white flex flex-col items-center justify-between pb-20">
      <div className="flex flex-col items-center justify-center w-[60vw] min-h-[70vh] space-y-8">
        <div className="w-24 h-24 bg-[#2A2A2A] rounded-full border-2 border-white flex justify-center items-center">
          <p>Profile</p>
        </div>
        <div className="relative w-full">
          <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading profile...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Name</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-lg font-semibold ml-[10%]">{user?.name || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Email</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-md text-gray-300 ml-[10%]">{user?.email_id || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Phone</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-md text-gray-300 ml-[10%]">{user?.phone_number || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

            {/* Reward Points Section */}
            <div className="flex flex-col items-center w-full mt-6">
              <h2 className="text-lg font-semibold text-white">Current Points</h2>
              <div 
                className="w-16 h-16 flex items-center justify-center bg-gray-700 text-white text-2xl font-bold rounded-md mt-2 cursor-pointer hover:bg-gray-600"
                onClick={handlePointsClick}
              >
                {user?.reward_points || "0"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center mt-6">
        <button
          onClick={handleLogout}
          className="px-2 py-1 text-sm bg-red-600 hover:bg-red-800 text-white font-semibold rounded-md transition duration-200"
          style={{ width: "80px", minWidth: "unset" }}
        >
          Logout
        </button>
      </div>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

export default UserProfile;