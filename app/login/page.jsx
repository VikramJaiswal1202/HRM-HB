"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Color theme variables
const bgMain = "#f6f9fc";
const bgCard = "#fff";
const accent = "#0D1A33";
const accentLight = "#4267b2";
const accentPurple = "#7d2ae8";

export default function Login() {
  const router = useRouter();

  // Load users from localStorage or use default
  const getInitialUsers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    }
    return [{ username: "rahul", password: "rahul" }];
  };

  const [users, setUsers] = useState(getInitialUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // Signup state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login state
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Keep users in localStorage in sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setLoginSuccess(true);
      router.push("/homepage"); // Redirect to homepage
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // Handle signup
  const handleSignup = (e) => {
    e.preventDefault();
    setSignupError("");
    if (!signupUsername || !signupPassword) {
      setSignupError("Please fill all fields");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match");
      return;
    }
    if (users.find((u) => u.username === signupUsername)) {
      setSignupError("Username already exists");
      return;
    }
    const newUsers = [...users, { username: signupUsername, password: signupPassword }];
    setUsers(newUsers);
    setSignupSuccess(true);
    setTimeout(() => {
      setShowSignup(false);
      setSignupSuccess(false);
      setSignupUsername("");
      setSignupPassword("");
      setSignupConfirm("");
      router.push("/homepage"); // Redirect to homepage after signup
    }, 800);
  };

  // Styles
  const inputBoxStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: `1px solid ${accentLight}`,
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#f4f7fb",
    color: accent,
    outline: "none",
    transition: "border 0.2s",
  };

  const cardStyle = {
    background: bgCard,
    padding: "40px 32px",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(13,26,51,0.08)",
    width: "100%",
    maxWidth: "370px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  // Signup page
  if (showSignup) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: bgMain,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form onSubmit={handleSignup} style={cardStyle}>
          <div
            style={{
              width: "70px",
              height: "70px",
              background: accent,
              borderRadius: "50%",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            <span>📝</span>
          </div>
          <h2
            style={{
              marginBottom: "18px",
              color: accent,
              fontWeight: 700,
              fontSize: "1.3rem",
            }}
          >
            Create Account
          </h2>
          <input
            type="text"
            placeholder="Username"
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            style={inputBoxStyle}
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            style={inputBoxStyle}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={signupConfirm}
            onChange={(e) => setSignupConfirm(e.target.value)}
            style={inputBoxStyle}
            autoComplete="new-password"
          />
          {signupError && (
            <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
              {signupError}
            </div>
          )}
          {signupSuccess && (
            <div style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}>
              Signup successful!
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: "10px",
              marginTop: "5px",
              letterSpacing: "0.5px",
            }}
          >
            Sign Up
          </button>
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            Already have an account?{" "}
            <span
              onClick={() => setShowSignup(false)}
              style={{
                color: accentPurple,
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              Sign In
            </span>
          </div>
        </form>
      </div>
    );
  }

  // Login page
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: bgMain,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form onSubmit={handleLogin} style={cardStyle}>
        <div
          style={{
            width: "70px",
            height: "70px",
            background: accent,
            borderRadius: "50%",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          <span>👤</span>
        </div>
        <h2
          style={{
            marginBottom: "18px",
            color: accent,
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          Sign In
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputBoxStyle}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputBoxStyle}
          autoComplete="current-password"
        />
        {loginError && (
          <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
            {loginError}
          </div>
        )}
        {loginSuccess && (
          <div style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}>
            Login successful!
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            marginBottom: "10px",
            marginTop: "5px",
            letterSpacing: "0.5px",
          }}
        >
          Sign In
        </button>
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          Not a member?{" "}
          <span
            onClick={() => setShowSignup(true)}
            style={{
              color: accentPurple,
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Create account
          </span>
        </div>
      </form>
    </div>
  );
}