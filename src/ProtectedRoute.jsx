import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext"; // Assuming you have UserContext

const ProtectedRoute = ({ children }) => {
  const { user } = useUser(); // Get the current user from context

  // If user is "guest" or null, redirect to login
  if (!user || user === "guest") {
    return <Navigate to="/login" />;
  }

  // If user is logged in, render the child component
  return children;
};

export default ProtectedRoute;
