import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่า Password กับ Confirm Password ตรงกันหรือไม่
    if (password !== confirmPassword) {
      alert("Password และ Confirm Password ไม่ตรงกัน");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง Backend
      const res = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
      });

      // หากสมัครสำเร็จ
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      // หากเกิดข้อผิดพลาด
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
