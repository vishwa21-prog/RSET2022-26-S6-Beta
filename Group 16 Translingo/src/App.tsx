import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContactsPage from "./components/ContactsPage";
import LoginPage from "./components/LoginPage";
import SignUp from "./components/Signup";
import './App.css';

const ProtectedRoute = ({ children }) => {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/contacts" 
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
