import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient.jsx";
import Footer from '../Footer/Footer.jsx';

function Redeem() {
  const { event_id, attendee_id } = useParams();
  const navigate = useNavigate();
  const [pointsAwarded, setPointsAwarded] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(null);
  const [sponsorInfo, setSponsorInfo] = useState({ name: "", offerDetails: "", redeemablePoints: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      // Fetch points_awarded from registrations table
      const { data: registrationData, error: registrationError } = await supabase
        .from("registrations")
        .select("points_awarded")
        .eq("event_id", event_id)
        .eq("attendee_id", attendee_id)
        .single();

      if (registrationError) {
        setError("Failed to fetch points awarded.");
        setLoading(false);
        return;
      }

      if (!registrationData) {
        setError("No registration found for this event and attendee.");
        setLoading(false);
        return;
      }

      setPointsAwarded(registrationData.points_awarded);

      // Fetch reward_points from participants table
      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("reward_points")
        .eq("id", attendee_id)
        .single();

      if (participantError) {
        setError("Failed to fetch reward points.");
        setLoading(false);
        return;
      }

      setRewardPoints(participantData?.reward_points || 0);

      // Fetch sponsor info through events table
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("sponsor_id")
        .eq("id", event_id)
        .single();

      if (eventError) {
        setError("Failed to fetch event details.");
        setLoading(false);
        return;
      }

      if (!eventData.sponsor_id) {
        setSponsorInfo({ name: "No Sponsor", offerDetails: "No offer details available", redeemablePoints: 0 });
        setLoading(false);
        return;
      }

      // Fetch sponsor name, offer_details, and redeemable_points
      const { data: sponsorData, error: sponsorError } = await supabase
        .from("sponsors")
        .select("name, offer_details, redeemable_points")
        .eq("id", eventData.sponsor_id)
        .single();

      if (sponsorError) {
        setError("Failed to fetch sponsor information.");
        setLoading(false);
        return;
      }

      setSponsorInfo({
        name: sponsorData.name || "Unknown Sponsor",
        offerDetails: sponsorData.offer_details || "No offer details available",
        redeemablePoints: sponsorData.redeemable_points || 0,
      });

      // Fetch all coupons for this attendee and event
      const { data: couponData, error: couponError } = await supabase
        .from("Reward_Coupon")
        .select("coupon_code")
        .eq("event_id", event_id)
        .eq("attendee_id", attendee_id);

      if (couponError) {
        setError("Failed to fetch coupon codes.");
        setLoading(false);
        return;
      }

      setCoupons(couponData || []);
      setLoading(false);
    };

    fetchData();
  }, [event_id, attendee_id]);

  const handleBackClick = () => {
    navigate(`/rewardpoints/${attendee_id}`);
  };

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleGenerateCoupon = async () => {
    if (rewardPoints === null || sponsorInfo.redeemablePoints === null) {
      setError("Data not fully loaded. Please try again.");
      return;
    }

    if (rewardPoints < sponsorInfo.redeemablePoints) {
      setError(`Insufficient reward points. You need ${sponsorInfo.redeemablePoints} points, but you have ${rewardPoints}.`);
      return;
    }

    const { data: eventData } = await supabase
      .from("events")
      .select("sponsor_id")
      .eq("id", event_id)
      .single();

    if (!eventData.sponsor_id) {
      setError("No sponsor associated with this event.");
      return;
    }

    const sponsor_id = eventData.sponsor_id;
    const newCouponCode = generateCouponCode();

    // Update reward_points in participants table
    const newRewardPoints = rewardPoints - sponsorInfo.redeemablePoints;
    const { error: updateError } = await supabase
      .from("participants")
      .update({ reward_points: newRewardPoints })
      .eq("id", attendee_id);

    if (updateError) {
      setError("Failed to update reward points.");
      return;
    }

    // Insert coupon into Reward_Coupon table
    const { error: insertError } = await supabase
      .from("Reward_Coupon")
      .insert({
        event_id,
        attendee_id,
        sponsor_id,
        coupon_code: newCouponCode,
      });

    if (insertError) {
      setError("Failed to generate coupon code.");
    } else {
      setRewardPoints(newRewardPoints);
      setCouponCode(newCouponCode);
      setCoupons([...coupons, { coupon_code: newCouponCode }]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1E1E1E] text-[#F5F5F5]">
      <div className="flex-grow overflow-y-auto">
        <div className="w-full max-w-md mx-auto p-4 pb-20">
          <button
            onClick={handleBackClick}
            className="mb-4 text-[#F5F5F5] bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center"
          >
            ← Back to Reward Points
          </button>

          <h1 className="text-2xl font-bold mb-4">Redeem Points</h1>
          

          {loading ? (
            <p className="text-gray-400 mt-4">Loading...</p>
          ) : error ? (
            <p className="text-red-400 mt-4">{error}</p>
          ) : (
            <div className="mt-6 bg-gray-800 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">⭐</span>
                  <span>Reward Points:</span>
                </div>
                <span>{rewardPoints}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🏆</span>
                  <span>Points Awarded:</span>
                </div>
                <span>{pointsAwarded}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🎉</span>
                  <span>Total Points:</span>
                </div>
                <span>{(pointsAwarded || 0) + (rewardPoints || 0)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🤝</span>
                  <span>Sponsor:</span>
                </div>
                <span>{sponsorInfo.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🎁</span>
                  <span>Offer Details:</span>
                </div>
                <span className="text-gray-300">{sponsorInfo.offerDetails}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🎟</span>
                  <span>Points for Coupon:</span>
                </div>
                <span>{sponsorInfo.redeemablePoints}</span>
              </div>
              <button
                onClick={handleGenerateCoupon}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Generate Coupon
              </button>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-yellow-400">{sponsorInfo.name} Coupons</h2>
                {coupons.length > 0 ? (
                  <div className="mt-2">
                    {coupons.map((coupon, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-2">
                        <span className="text-green-400">Code: {coupon.coupon_code}</span>
                        <span className="text-gray-300">{sponsorInfo.offerDetails}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 mt-2">No coupons generated yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Redeem;