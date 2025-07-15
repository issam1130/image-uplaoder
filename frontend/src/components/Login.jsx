import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Login() {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth(); 

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
      const res = await fetch(`${import.meta.env.VITE_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inputs),
      });

      if (res.ok) {
        alert("Login successful");
        await fetchUser(); 
        navigate("/post");
      } else {
        const data = await res.json();
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
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
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
