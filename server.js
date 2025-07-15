import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Post from "./Model/Post.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import User from "./Model/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";



const app = express();
app.use(cookieParser());

// Connect to MongoDB
try {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
}

app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,               
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve frontend (e.g., Vite build)
app.use(express.static(path.join(__dirname, "frontend/dist")));

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const uploadFolder = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadFolder);
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.originalname.slice(0, 3) + Date.now().toString().slice(-5)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 }, 
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedTypes.includes(file.mimetype)
      ? callback(null, true)
      : callback(new Error("Only .png, .jpeg, or .jpg is allowed"));
  },
});


app.get("/posts", async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});


app.post("/add", upload.single("image"), async (req, res, next) => {
  try {
    const newPost = new Post({
      username: req.body.username,
      caption: req.body.caption,
      image: req.file?.filename,
    });

    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    next(error);
  }
});


app.put("/update/:id", upload.single("image"), async (req, res, next) => {
  try {
    const postId = req.params.id;
    const updateData = {
      username: req.body.username,
      caption: req.body.caption,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
});


app.delete("/delete/:id", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// ❌ Catch-all (optional - uncomment for SPA routing)
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
// });


app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Max 150KB allowed." });
  }
  res.status(err.status || 500).json({ error: err.message });
});

app.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set true in production with HTTPS
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Logged in" });
  } catch (err) {
    next(err);
  }
});

app.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});


// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
