import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Album from "./Model/Album.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

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

//* Serve frontend from the server side
// get the absolute path to the current file `server.js`
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
// then we can get the absolute path to the directory of current file
const __dirname = path.dirname(__filename); 
console.log(__dirname);

//* Let's now serve our frontend
app.use(express.static(path.join(__dirname, "frontend/dist"))); // the absolute path to our frontend: current directory/frontend/dist

//* Multer config
//? Our goal: Create a middleware function `upload()` using multer to parse the incoming file (from the client side) and save it on disk!

//* Storage setup
// multer.diskStorage(): Tells multer to store the uploaded files on disk (instead of memory). => We get a full control over where and how the files are saved

//* Two main storage options
// 	destination: A function that tells multer where to save the file
//	filename: A function that defines what to name the file when saving

//* Give two options (for development, and production)
let storage;
if (process.env.NODE_ENV === "development") {
  storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "frontend/public");
    },
    filename: (req, file, callback) => {
      callback(
        null,
        file.originalname.slice(0, 3) + Date.now().toString().slice(-5)
      ); 
    },
  });
} else  {
  storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "frontend/dist");
    },
    filename: (req, file, callback) => {
      callback(
        null,
        file.originalname.slice(0, 3) + Date.now().toString().slice(-5)
      ); 
    },
  });
}

//* Declare a `upload` middleware function
const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 }, // 150kb (1kb = 1024bytes)
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedTypes.includes(file.mimetype)
      ? callback(null, true)
      : callback(new Error("only .png, jpeg, or .jpg is allowed"));
  },
});

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
      jacket: req.file?.filename, // uploaded file is parsed by multer and is accessible from req.file
    });
    console.log(req.file.filename);
    await newAlbum.save();
    res.status(200).json(newAlbum);
  } catch (error) {
    next(error);
  }
});

//? PATCH /update:id - Update album image
app.patch("/update/:id", upload.single("jacket"), async (req, res, next) => {
  try {
    // if user didn't attach a file, let's throw an error
    if (!req.file) throw new Error("Hey, no file uploaded.");
    const id = req.params.id;
    console.log(id);
    let toUpdate = await Album.findByIdAndUpdate(
      id,
      { jacket: req.file.filename },
      { new: true }
    );
    console.log(req.file.filename);
    res.status(200).json(toUpdate);
  } catch (err) {
    next(err);
  }
});

//* Catch-all handler: Any GET request that don't match any backend routes will be going into this handler
// when react router has certain routes, they'll be coming here
// react app takes over and uses client-side routing
app.get("/{*splat}", (req, res) => {
  res.sendFile(__dirname + "/frontend/dist/index.html");
});

//* Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Max 150KB allowed." });
  }
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
