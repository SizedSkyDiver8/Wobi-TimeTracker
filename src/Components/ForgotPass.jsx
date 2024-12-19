import React, { useState } from "react";
import blindIcon from "../assets/blind.png";
import showPasswordIcon from "../assets/show-password.png";
import { useNavigate } from "react-router-dom";

export default function ForgotPass() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [checkPassword, setCheckPassword] = useState(""); // State for checking last known password
  const [error, setError] = useState("");
  const [switchMode, setSwitchMode] = useState("username");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const navigate = useNavigate();

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  const checkUser = async () => {
    setError("");
    if (!username) {
      setError("Username is required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/checkUsername", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (response.ok && data.usernameTaken) {
        setSwitchMode("checkPass");
      } else if (response.ok && !data.usernameTaken) {
        setError("Username not found. Please try again.");
      } else {
        setError("Unexpected error. Please try again later.");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setError("Server error. Please try again later.");
    }
  };

  const validateRePassword = () => {
    if (password !== rePassword) {
      setError("Passwords do not match!");
    } else {
      setError("");
    }
  };

  const checkPass = async () => {
    setError("");
    if (!username || !checkPassword) {
      setError("Username and password are required.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/checkPass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pass: checkPassword }),
      });
      const data = await response.json();
      if (response.ok && data.usernameTaken) {
        setSwitchMode("passwords");
      } else if (response.ok && !data.usernameTaken) {
        setError("Please try another password.");
      } else {
        setError("Unexpected error. Please try again later.");
      }
    } catch (error) {
      console.error("Error checking password:", error);
      setError("Server error. Please try again later.");
    }
  };

  const changePass = async () => {
    setError("");
    if (!password || !rePassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== rePassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/changePass", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        setError(data.message || "Unexpected error. Please try again later.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="divLogin">
      <div className="headerLogin">
        <h1>Forgot Password</h1>
      </div>

      {switchMode === "checkPass" ? (
        <p className="last-password-text">
          What is the last password you remember?
        </p>
      ) : (
        ""
      )}
      {/* Check username input */}
      {switchMode === "username" && (
        <div className="inputContainer">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
      )}

      {/* Check password input */}
      {switchMode === "checkPass" && (
        <div className="inputContainer">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Last known password"
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
          />
          <img
            src={!showPassword ? blindIcon : showPasswordIcon}
            alt="Toggle password visibility"
            onClick={togglePasswordVisibility}
            className="togglePasswordIcon"
          />
        </div>
      )}

      {/* Password and Re-Password input */}
      {switchMode === "passwords" && (
        <>
          <div className={`inputContainer ${passwordStrength}`}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
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
          <div className="inputContainer">
            <input
              type={showRePassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              onBlur={validateRePassword}
            />
            <img
              src={!showRePassword ? blindIcon : showPasswordIcon}
              alt="Toggle password visibility"
              onClick={toggleRePasswordVisibility}
              className="togglePasswordIcon"
            />
          </div>
        </>
      )}

      {/* Error Message */}
      {error && <div className="err-message">{error}</div>}

      {/* Submit buttons */}
      {switchMode === "username" && (
        <div className="divButtons">
          <button onClick={checkUser}>Submit</button>
        </div>
      )}

      {switchMode === "checkPass" && (
        <div className="divButtons">
          <button onClick={checkPass}>Submit</button>
        </div>
      )}

      {switchMode === "passwords" && (
        <div className="divButtons">
          <button onClick={changePass}>Submit</button>
        </div>
      )}
    </div>
  );
}
