import { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Import Supabase client
import { useNavigate } from "react-router-dom";

export default function AdminFeed() {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthorities = async () => {
      const { data, error } = await supabase
        .from("authorities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching authorities:", error.message);
      } else {
        setAuthorities(data);
      }
      setLoading(false);
    };

    fetchAuthorities();
  }, []);

  const handleApproval = async (id, isApproved) => {
    const { error } = await supabase
      .from("authorities")
      .update({ approved: isApproved })
      .eq("id", id);

    if (error) {
      console.error("Error updating approval status:", error.message);
    } else {
      setAuthorities((prev) =>
        prev.map((auth) =>
          auth.id === id ? { ...auth, approved: isApproved } : auth
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <p className="text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-cyan-200 to-green-100 p-10">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-10 text-center drop-shadow-lg">
        🛡️ Authorities Sign Up Approval List
      </h1>

      {/* Authorities Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl w-full max-w-5xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <th className="p-5">ID</th>
              <th className="p-5">Name</th>
              <th className="p-5">Phone</th>
              <th className="p-5">Email</th>
              <th className="p-5">Created At</th>
              <th className="p-5 text-center">Approval</th>
            </tr>
          </thead>
          <tbody>
            {authorities.length > 0 ? (
              authorities.map((auth, index) => (
                <tr
                  key={auth.id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="p-4 text-gray-800 font-semibold">{auth.id}</td>
                  <td className="p-4 text-blue-700 font-medium">{auth.name}</td>
                  <td className="p-4 text-teal-600">{auth.phone}</td>
                  <td className="p-4 text-purple-700">{auth.email}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(auth.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={auth.approved}
                      onChange={(e) => handleApproval(auth.id, e.target.checked)}
                      className="w-6 h-6 accent-green-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-5 text-red-500">
                  No authorities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-10">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
        >
          ⬅️ Back to Home
        </button>
      </div>
    </div>
  );
}
