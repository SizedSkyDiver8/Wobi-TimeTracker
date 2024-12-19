import React, { createContext, useState, useContext } from "react";

// Create the User Context
const UserContext = createContext();

// Create a Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState("guest");

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook for Easy Access
export const useUser = () => {
  return useContext(UserContext); // Correctly access the context
};

export default UserContext;
