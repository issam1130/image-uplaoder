import { useState, useRef } from "react";

function PostCard({ post, getPosts }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputs, setInputs] = useState({
    username: post.username,
    caption: post.caption,
    image: null,
  });

  const fileRef = useRef(null);

  function handleInputChange(e) {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleDelete() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/delete/${post._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        getPosts(); // Refresh post list
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", inputs.username);
    formData.append("caption", inputs.caption);
    if (inputs.image) {
      formData.append("image", inputs.image);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/update/${post._id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setIsEditing(false);
        getPosts(); // Refresh post list
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="post-card">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="edit-form">
          <input
            type="text"
            name="username"
            value={inputs.username}
            onChange={handleInputChange}
            placeholder="Username"
          />
          <textarea
            name="caption"
            value={inputs.caption}
            onChange={handleInputChange}
            placeholder="Caption"
          />
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={(e) =>
              setInputs((prev) => ({
                ...prev,
                image: e.target.files[0],
              }))
            }
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <h3>{post.username}</h3>
          <p>{post.caption}</p>
          {post.image && (
            <img
              src={`${import.meta.env.VITE_API}/uploads/${post.image}`}
              alt="post"
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
          )}
          <div className="actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default PostCard;
