import { useState } from "react";

const Album = ({ album, getAlbums, inputs, setInputs }) => {
  const [isEditing, setIsEditing] = useState(false);

  /* 
  ? create an instance of FormData and append the uploaded album jacket
  ? make a fetch call to /API/update/:id 
  ? when the response is ok, alert the user & call the function getAlbums() to update the page
  ? change setIsEditing to false
   */

  async function handleUpdate() {
    try {
      const formData = new FormData();
      formData.append("jacket", inputs.jacket);

      const response = await fetch(
        `${import.meta.env.VITE_API}/update/${album._id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.ok) {
        alert("updated!");
        getAlbums();
        setIsEditing(!isEditing);
      } else {
        throw new Error("please try again with a valid file");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  /* 
  ? make a fetch call to "API/delete/:id"
  ? when the response is ok, alert the user & call the function getAlbums() to update the page
  */

  async function handleDelete() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/delete/${album._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("deleted!");
        getAlbums();
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="card">
      {!isEditing && (
        <div className="img-container">
          <img width="100" height="100" src={album.jacket} alt="album jacket" />
          <button onClick={() => setIsEditing(!isEditing)}>Change image</button>
        </div>
      )}
      {isEditing && (
        <div className="update">
          <input
            type="file"
            onChange={(e) =>
              setInputs({ ...inputs, jacket: e.target.files[0] })
            }
            accept="image/*"
          />
          <div className="update-btn">
            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => setIsEditing(false)}>Back</button>
          </div>
        </div>
      )}
      <p>Artist: {album.artist}</p>
      <p>Title: {album.title}</p>
      <p>{album.year}</p>

      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default Album;
