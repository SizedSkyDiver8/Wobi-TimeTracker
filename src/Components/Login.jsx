import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import blindIcon from "../assets/blind.png";
import showPasswordIcon from "../assets/show-password.png";
import wobi from "../assets/wobi.png";
import britian from "../assets/Flag_Britain.png";
import germany from "../assets/Flag_Germany.png";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginClick = async () => {
    setError("");
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.role === "admin") {
          navigate("/Admin");
        } else if (data.user.role === "user") {
          navigate("/user");
        }
      } else {
        // Handle login failure
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("Unable to connect to the server. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <div className="flags">
        <img src={britian} />
        <img src={germany} />
      </div>
      <div className="divLogin">
        <div className="headerLogin">
          <img src={wobi} alt="wobi logo" />
        </div>
        <div className="divInputs">
          <div className="inputContainer">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-label="Username"
            />
          </div>
          <div className="inputContainer">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Password"
            />
            <img
              src={!showPassword ? blindIcon : showPasswordIcon}
              alt="Toggle password visibility"
              onClick={togglePasswordVisibility}
              className="togglePasswordIcon"
            />
          </div>
        </div>
        {error && <div className="err-message">{error}</div>}
        <div className="divButtons">
          <button onClick={handleLoginClick}>Login</button>
        </div>
        <div className="div-Buttons-low">
          <button onClick={() => navigate("/signUp")}>Register</button>
          <button onClick={() => navigate("/forgot")}>Forgot password</button>
        </div>
      </div>
    </>
  );
}
