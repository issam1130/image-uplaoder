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
  const formData = new FormData();
  formData.append("jacket", inputs.jacket);

  try {
    const res = await fetch(`${import.meta.env.VITE_API}/update/${album._id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update image");

    const updatedAlbum = await res.json();
    alert("Image updated successfully!");
    getAlbums();
    setIsEditing(false);
  } catch (err) {
    console.error(err);
    alert("Update failed.");
  }
}


  /* 
  ? make a fetch call to "API/delete/:id"
  ? when the response is ok, alert the user & call the function getAlbums() to update the page
  ? 
  */
async function handleDelete() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/delete/${album._id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete album");

    alert("Album deleted successfully!");
    getAlbums();
  } catch (err) {
    console.error(err);
    alert("Delete failed.");
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