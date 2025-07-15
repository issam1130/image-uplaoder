import { useState, useRef, useEffect } from "react";
import PostCard from "./PostCard";
import { useAuth } from "./AuthContext";


function PostForm({ setNewPost }) {
  const [inputs, setInputs] = useState({});
  const [posts, setPosts] = useState([]);
  const fileInput = useRef(null);
    const { user } = useAuth();

  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  function handleChange(e) {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
     
  
    formData.append("username", inputs.username);
    formData.append("caption", inputs.caption);
    if (inputs.image) {
      formData.append("image", inputs.image);
    }

    setInputs({});
    fileInput.current.value = "";

    try {
      const response = await fetch(`${import.meta.env.VITE_API}/add`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setNewPost(data);
        alert("Posted!");
        getPosts(); // Refresh posts after submission
      } else {
        throw new Error(data?.error || "Failed to post");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>

      {user && (
        <h2 style={{ marginBottom: "1rem" }}>Welcome, {user.username}!</h2>
      )}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Username"
          onChange={handleChange}
          value={inputs.username || ""}
          name="username"
        />
        <textarea
          placeholder="Write a caption..."
          onChange={handleChange}
          value={inputs.caption || ""}
          name="caption"
        />
        <input
          type="file"
          ref={fileInput}
          onChange={(e) =>
            setInputs((prev) => ({ ...prev, image: e.target.files[0] }))
          }
          accept="image/*"
        />
        <button>Post</button>
      </form>

      <h2 style={{ marginTop: "2rem" }}>Your Posts</h2>
      <div className="posts-list">
        {posts.length > 0 &&
          posts.map((post) => (
            <PostCard key={post._id} post={post} getPosts={getPosts} />
          ))}
      </div>
    </>
  );
}

export default PostForm;
