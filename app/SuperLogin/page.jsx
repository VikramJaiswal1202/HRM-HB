"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const accent = "#0D1A33";
const accentPurple = "#7d2ae8";
const bgCard = "#fff";
const accentLight = "#4267b2";

export default function SuperLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    // Auto-fill if remembered
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("superadmin-remember");
      if (remembered) {
        const creds = JSON.parse(remembered);
        setUsername(creds.username);
        setPassword(creds.password);
        setRemember(true);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      // Only allow superadmin
      if (data.user.role !== "superadmin") {
        setLoginError("Access denied: Not a super admin");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Save credentials if "remember me" is checked
      if (remember) {
        localStorage.setItem(
          "superadmin-remember",
          JSON.stringify({ username, password })
        );
      } else {
        localStorage.removeItem("superadmin-remember");
      }

      setLoginSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/Super");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Something went wrong. Please try again.");
    }
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
    zIndex: 2,
    margin: "80px auto",
  };

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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f6f9fc",
        padding: "16px",
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
          🛡️
        </div>

        <h2
          style={{
            marginBottom: "18px",
            color: accent,
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          Super Admin Login
        </h2>

        <input
          type="text"
          placeholder="Super Admin Username"
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

        <div
          style={{
            width: "100%",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={() => setRemember(!remember)}
            style={{
              marginRight: 8,
              accentColor: accent,
              width: 16,
              height: 16,
            }}
          />
          <label
            htmlFor="remember"
            style={{ color: accent, fontSize: "15px", cursor: "pointer" }}
          >
            Remember me
          </label>
        </div>

        {loginError && (
          <div
            style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}
          >
            {loginError}
          </div>
        )}

        {loginSuccess && (
          <div
            style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}
          >
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
            transition: "background 0.2s",
          }}
        >
          Sign In
        </button>

        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <span
            onClick={() => router.push("/login")}
            style={{
              color: accentPurple,
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Back to User Login
          </span>
        </div>
      </form>
    </div>
  );
}
