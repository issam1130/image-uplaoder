import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Album from "./Model/Album.js";
import multer from "multer";

const app = express();

//* MongoDB connection
try {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
}

//* Middleware setup
app.use(express.json());
app.use(cors());

//* Multer config
//? Our goal: Create a middleware function `upload()` using multer to parse the incoming file (from the client side) and save it on disk!

//* Storage setup
// multer.diskStorage(): Tells multer to store the uploaded files on disk (instead of memory). => We get a full control over where and how the files are saved

//* Two main storage options
// 	destination: A function that tells multer where to save the file
//	filename: A function that defines what to name the file when saving

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "frontend/public");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname); 
  },
});

//* Declare a `upload` middleware function
const upload = multer({ storage: storage });

//* Routes
//? GET /albums - fetch all albums
app.get("/albums", async (req, res, next) => {
  try {
    const albums = await Album.find();
    res.status(200).json(albums);
  } catch (error) {
    next(error);
  }
});

//? DELETE /delete/:id - Delete album by ID
app.delete("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Album.findByIdAndDelete(id);
    res.status(200).send("deleted!");
  } catch (error) {
    next(error);
  }
});

//? POST /add - Add new album
app.post("/add", upload.single("jacket"), async (req, res, next) => {
  try {
    // artist, year, title are coming from req.body
    const newAlbum = new Album({
      ...req.body,
      jacket: req.file?.filename,
    });

    await newAlbum.save();
    res.status(200).json(newAlbum);
  } catch (error) {
    next(error);
  }
});
//? PATCH /update:id - Update album image

//? PATCH /update/:id - Update album image
app.patch("/update/:id", upload.single("jacket"), async (req, res, next) => {
  try {
    const { id } = req.params;

  
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      id,
      { jacket: req.file.filename },
      { new: true } 
    );

    if (!updatedAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json(updatedAlbum);
  } catch (error) {
    next(error);
  }
});


//* Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
