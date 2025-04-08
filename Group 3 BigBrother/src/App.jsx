import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import UserLogin from "./components/UserLogin";
import AuthorityLogin from "./components/AuthorityLogin";
import UserFeed from "./components/UserFeed";
import AuthorityFeed from "./components/AuthorityFeed";
import IssueDetails from "./components/IssueDetails"; // ✅ Import Issue Details Page
import AuthorityIssueDetails from "./components/AuthorityIssueDetails"; // ✅ Import Authority Issue Details Page
import AuthoritySignup from "./components/AuthoritySignup";
import AdminLogin from "./components/AdminLogin";
import ReportIssue from "./components/ReportIssue"; // Import the new page
import UserSignup from "./components/UserSignup";
import AdminFeed from "./components/AdminFeed";  // ✅ Import the Admin Feed Page
import UserProfile from "./components/UserProfile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/authority-login" element={<AuthorityLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-feed" element={<AdminFeed />} />  {/* ✅ Added Admin Feed Route */}
        <Route path="/authority-signup" element={<AuthoritySignup />} />
        <Route path="/user-feed" element={<UserFeed />} />
        <Route path="/authority-feed" element={<AuthorityFeed />} />
        <Route path="/issue/:id" element={<IssueDetails />} /> {/* ✅ User issue details */}
        <Route path="/authority-issue/:id" element={<AuthorityIssueDetails />} /> {/* ✅ Authority Issue Details */}
        <Route path="/report-issue" element={<ReportIssue />} /> {/* New Route */}
        <Route path="/user-signup" element={<UserSignup />} /> {/* New Route */}
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}
