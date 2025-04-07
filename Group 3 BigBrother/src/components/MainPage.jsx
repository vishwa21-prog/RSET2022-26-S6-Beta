import { Link } from "react-router-dom";

export default function MainPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center text-white p-6 relative" style={{ backgroundImage: "url('/bigbro2.jpg')" }}>
      
      <div className="text-center max-w-lg bg-black bg-opacity-50 p-6 rounded-lg">
        <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">BIG BROTHER</h1>
        
        <p className="text-xl mb-6 font-light tracking-wide">#BigBrotherIsWatchingYou</p>
        
        <div className="flex flex-col gap-4 items-center">
          <Link to="/user-login">
            <button className="px-6 py-3 bg-white text-[#2a92c7] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition transform hover:scale-110">
              User Login
            </button>
          </Link>

          <Link to="/authority-login">
            <button className="px-6 py-3 bg-white text-[#2a92c7] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition transform hover:scale-110">
              Authority Login
            </button>
          </Link>

          <Link to="/admin-login">
            <button className="px-6 py-3 bg-white text-[#2a92c7] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition transform hover:scale-110">
              Admin Login
            </button>
          </Link>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="absolute bottom-6 text-center">
        <p className="text-lg text-white font-light">
          💌 Need help? Contact us at 
          <a href="mailto:big.brother.eight.1984@gmail.com" className="text-blue-300 font-semibold hover:underline ml-2">
          big.brother.eight.1984@gmail.com
          </a>
        </p>
      </div>
      
    </div>
  );
}
