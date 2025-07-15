import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import "./App.css";
import PostCard from "./components/PostCard";
import PostForm from "./components/PostForm";
import Register from "./components/Register";
import Login from "./components/Login";
import { useAuth } from "./components/AuthContext";

function Home({ posts, getPosts }) {
  return (
    <>
      <h1>Recent Posts</h1>
      {!!posts.length &&
        posts.map((post) => (
          <PostCard key={post._id} post={post} getPosts={getPosts} />
        ))}
    </>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    getPosts();
  }, [newPost]);

  async function getPosts() {
    const response = await fetch(`${import.meta.env.VITE_API}/posts`);
    if (response.ok) {
      const data = await response.json();
      setPosts(data);
    }
  }

  return (
    <Router>
      <header>
        <nav className="navbar">
          <ul>
            <li><Link to="/">Home</Link></li>
            {user && <li><Link to="/post">Create Post</Link></li>}
            {!user && (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
            {user && (
              <>
                  {/* <li>Welcome, {user.username}</li> */} 
                <li><button onClick={logout}>Logout</button></li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home posts={posts} getPosts={getPosts} />} />
          <Route
            path="/post"
            element={user ? <PostForm setNewPost={setNewPost} /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/post" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/post" />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
