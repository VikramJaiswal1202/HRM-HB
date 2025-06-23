"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

// Color theme variables
const bgMain = "#f6f9fc";
const bgCard = "#fff";
const accent = "#0D1A33";
const accentLight = "#4267b2";
const accentPurple = "#7d2ae8";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Invalid server response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Redirect based on role
      switch (data.role) {
        case 'superadmin':
          router.push('/super');
          break;
        case 'company':
          router.push('/homepageC');
          break;
        case 'hr':
          router.push('/homepageHR');
          break;
        case 'manager':
          router.push('/homepageM');
          break;
        case 'employee':
          router.push('/homepageE');
          break;
        default:
          router.push('/homepage');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
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
  };

  const passwordContainerStyle = {
    position: "relative",
    width: "100%",
  };

  const passwordInputStyle = {
    ...inputBoxStyle,
    paddingRight: "40px", // Make space for the eye icon
  };

  const togglePasswordStyle = {
    position: "absolute",
    right: "12px",
    top: "12px",
    cursor: "pointer",
    color: accentLight,
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
  };

  const mainContainer = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    background: bgMain,
  };

  const leftPanel = {
    flex: 1.2,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "100vh",
  };

  const imageBgStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
    filter: "brightness(0.7)",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, rgba(13,26,51,0.55) 0%, rgba(125,42,232,0.28) 100%)",
    zIndex: 2,
  };

  const floatingTextStyle = {
    position: "relative",
    zIndex: 3,
    textAlign: "center",
    color: "#fff",
    maxWidth: 480,
    padding: "0 24px",
    userSelect: "none",
  };

  const rightPanel = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
  };

  return (
    <div style={mainContainer}>
      <div style={leftPanel}>
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
          alt="Employee Management"
          style={imageBgStyle}
        />
        <div style={overlayStyle}></div>
        <div style={floatingTextStyle}>
          <h1 style={{ fontWeight: 800, fontSize: "2.2rem", marginBottom: 12, letterSpacing: 1 }}>
            Welcome to <span style={{ color: "#ffd700" }}>HRPulse</span>
          </h1>
          <p style={{ fontSize: "1.1rem", fontWeight: 400, color: "#f4f7fb" }}>
            Streamline your HR processes, manage employees, and empower your team with our all-in-one HRM platform.
          </p>
        </div>
      </div>
      <div style={rightPanel}>
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputBoxStyle}
            autoComplete="username"
            required
          />
          <div style={passwordContainerStyle}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={passwordInputStyle}
              autoComplete="current-password"
              required
            />
            <span 
              style={togglePasswordStyle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {loginError && (
            <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
              {loginError}
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
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}