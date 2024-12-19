import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import blindIcon from "../assets/blind.png";
import showPasswordIcon from "../assets/show-password.png";

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [rePass, setRePass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");

  // Function to check password strength
  const checkPasswordStrength = (password) => {
    let categories = 0;
    if (/[a-z]/.test(password)) categories++; // Lowercase
    if (/[A-Z]/.test(password)) categories++; // Uppercase
    if (/\d/.test(password)) categories++; // Numbers
    if (/[^a-zA-Z\d]/.test(password)) categories++; // Symbols
    if (password.length < 3) return "weak"; 
    if (password.length <= 4) return "medium"; 
    if (categories >= 4) return "strong"; 
    if (categories === 3) return "medium"; 
    return "weak"; 
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPass(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSignUp = async () => {
    setError("");
    if (!name || !pass || !rePass) {
      setError("All fields are required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/checkUsername", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const data = await response.json();
      if (data.usernameTaken) {
        setError("Username is already taken.");
        return;
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setError("Server error. Please try again later.");
      return;
    }
    if (pass !== rePass) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength === "weak") {
      setError("Password is weak, make it stronger💪🏻");
      return;
    }
    try {
      const addUserResponse = await fetch("http://localhost:3001/AddUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, password: pass }),
      });

      if (!addUserResponse.ok) {
        const errorData = await addUserResponse.json();
        setError(errorData.message || "Failed to add user.");
        return;
      }

      alert("User signed up successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Server error. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleRePasswordVisibility = () => setShowRePassword((prev) => !prev);

  return (
    <div className="divLogin">
      <div className="headerSignUp">
        <h1>Sign Up</h1>
      </div>
      <div className="divInputs">
        {/* Username */}
        <div className="inputContainer">
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {/* Password */}
        <div className={`inputContainer ${passwordStrength}`}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={pass}
            onChange={handlePasswordChange}
          />
          <img
            src={!showPassword ? blindIcon : showPasswordIcon}
            alt="Toggle password visibility"
            onClick={togglePasswordVisibility}
            className="togglePasswordIcon"
          />
        </div>
        <span className={`password-strength ${passwordStrength}`}>
          Password Strength: {passwordStrength.toUpperCase()}
        </span>

        {/* Re-Password */}
        <div className="inputContainer">
          <input
            type={showRePassword ? "text" : "password"}
            placeholder="Re-Password"
            value={rePass}
            onChange={(event) => setRePass(event.target.value)}
          />
          <img
            src={!showRePassword ? blindIcon : showPasswordIcon}
            alt="Toggle re-password visibility"
            onClick={toggleRePasswordVisibility}
            className="togglePasswordIcon"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="err-message">{error}</div>}

      {/* Buttons */}
      <div className="divButtonsSignUp">
        <button onClick={() => navigate("/login")}>Back</button>
        <button onClick={handleSignUp}>Sign up</button>
      </div>
    </div>
  );
}
