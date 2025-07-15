import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // adjust the path as needed

function Register() {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/post");
    }
  }, [user, navigate]);

  function handleChange(e) {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registered successfully! Please login.");
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error registering");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Register</h2>
      <input
        name="username"
        placeholder="Username"
        value={inputs.username}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={inputs.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
