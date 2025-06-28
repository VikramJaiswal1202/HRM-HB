"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const accent = "#0D1A33";
const accentPurple = "#7d2ae8";
const bgCard = "#fff";
const accentLight = "#4267b2";

export default function SuperAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Style definitions
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

  // Initialize form data properly
  useEffect(() => {
    if (isLogin && typeof window !== "undefined") {
      const remembered = localStorage.getItem("superadmin-remember");
      if (remembered) {
        try {
          const creds = JSON.parse(remembered);
          setFormData({
            name: "",
            email: creds.email || "",
            password: creds.password || ""
          });
          setRemember(true);
        } catch (e) {
          console.error("Error parsing remembered credentials:", e);
        }
      }
    }
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (!isLogin && !formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login request - matches your backend API
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),  // Changed from username to email
            password: formData.password.trim()
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        // No need to store token manually since it's httpOnly cookie
        if (remember) {
          localStorage.setItem(
            "superadmin-remember",
            JSON.stringify({
              email: formData.email.trim(),
              password: formData.password.trim()
            })
          );
        }

        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (data.role === "superadmin") {
            router.push("/super");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      } else {
        // Signup request
        const res = await fetch("/api/superadmin/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim()
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Signup failed");
        }

        // Auto-login after signup
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),  // Changed from username to email
            password: formData.password.trim()
          }),
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error("Account created but login failed. Please login manually.");
        }

        if (remember) {
          localStorage.setItem(
            "superadmin-remember",
            JSON.stringify({
              email: formData.email.trim(),
              password: formData.password.trim()
            })
          );
        }

        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          if (loginData.role === "superadmin") {
            router.push("/Super");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Authentication Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
      <form onSubmit={handleSubmit} style={cardStyle}>
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
          {isLogin ? "🛡️" : "👑"}
        </div>

        <h2
          style={{
            marginBottom: "18px",
            color: accent,
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          {isLogin ? "Super Admin Login" : "Create Super Admin"}
        </h2>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={inputBoxStyle}
            autoComplete="name"
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          style={inputBoxStyle}
          autoComplete={isLogin ? "username" : "email"}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={inputBoxStyle}
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />

        {isLogin && (
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
        )}

        {error && (
          <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            background: isLoading ? "#ccc" : accent,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: "10px",
            marginTop: "5px",
            letterSpacing: "0.5px",
            transition: "background 0.2s",
          }}
        >
          {isLoading ? (
            "Processing..."
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>

        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            style={{
              color: accentPurple,
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "underline",
              marginRight: "10px",
            }}
          >
            {isLogin ? "Create Account" : "Already have an account? Login"}
          </span>

          {isLogin && (
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
          )}
        </div>
      </form>
    </div>
  );
}