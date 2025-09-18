import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ เก็บ token, uid, email ไว้ใช้ทีหลัง
        localStorage.setItem("token", data.token);

        // รองรับได้ทั้ง data.user._id และ data.userId
        if (data.user?._id) localStorage.setItem("uid", data.user._id);
        else if (data.userId) localStorage.setItem("uid", data.userId);

        if (data.user?.email) localStorage.setItem("email", data.user.email);
        else if (data.email) localStorage.setItem("email", data.email);
        else localStorage.setItem("email", email); // fallback

        navigate("/upload");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      setError("Network error");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        className="link"
        onClick={() => navigate("/forgot-password")}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Forgot Password?
      </div>
      <div
        className="link"
        onClick={() => navigate("/register")}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Register
      </div>
    </div>
  );
}

export default Login;
