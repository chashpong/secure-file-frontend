import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state
    try {
      // ส่งข้อมูลไปที่ Backend
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ หากเข้าสู่ระบบสำเร็จ
        localStorage.setItem('token', data.token); // เก็บ JWT token ลง localStorage
        navigate('/upload'); // ไปหน้า upload
      } else {
        // ❌ หากเกิดข้อผิดพลาด
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login Error:', err);
      setError('Network error');
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="link" onClick={() => navigate("/forgot-password")}>
        Forgot Password?
      </div>
    </div>
  );
}

export default Login;
