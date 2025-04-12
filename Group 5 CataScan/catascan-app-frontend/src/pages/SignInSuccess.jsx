import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SignInSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d2a34] to-[#6d8c94] flex items-center justify-center p-6">
      <div className="bg-[#1a3c40]/80 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-lg border border-[#b3d1d6]/20 flex flex-col items-center justify-center animate-fade-in">
        <div className="relative mb-8">
          <CheckCircle className="w-20 h-20 text-[#b3d1d6] animate-bounce" />
          <div className="absolute inset-0 w-24 h-24 border-2 border-dotted border-[#b3d1d6]/50 rounded-full animate-ping" />
        </div>
        <h2 className="text-3xl font-bold text-[#b3d1d6] tracking-tight">
          Sign In Successful!
        </h2>
        <p className="text-[#b3d1d6]/80 mt-4 text-lg">
          Redirecting to Dashboard...
        </p>
        <div className="w-3/4 bg-[#6d8c94]/20 h-1.5 mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-[#b3d1d6] animate-loading-bar" />
        </div>
      </div>
    </div>
  );
};

export default SignInSuccess;
