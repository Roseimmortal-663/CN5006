// Server.js (API + serve React build on port 5000)

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const Books = require("./BooksSchema");
const connectDB = require("./MongoDBConnect");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// serve React build folder (make sure backend/build exists)
app.use(express.static(path.join(__dirname, "build")));

// API routes
app.get("/about", async (req, res) => {
  const count = await Books.countDocuments();
  res.json({
    message: "mongodb express React and mongoose app",
    totalBooks: count,
  });
});

// 1) GET ALL BOOKS
app.get("/books", async (req, res) => {
  try {
    const books = await Books.find();
    return res.json(books);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch books", details: err.message });
  }
});

// 2) GET ONE BOOK BY ID
app.get("/books/:id", async (req, res) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    return res.json(book);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch book", details: err.message });
  }
});

// 3) CREATE BOOK
app.post("/books", async (req, res) => {
  try {
    const newBook = new Books(req.body);
    const saved = await newBook.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Adding new book failed", details: err.message });
  }
});

// 4) UPDATE BOOK
app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Books.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBook) return res.status(404).json({ error: "Book not found" });
    return res.json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update book", details: err.message });
  }
});

// 5) DELETE BOOK
app.delete("/books/:id", async (req, res) => {
  try {
    const deletedBook = await Books.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ error: "Book not found" });
    return res.json({ message: "Book deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to delete book", details: err.message });
  }
});

// React fallback route (must be LAST)
// Fix for PathError: do NOT use "*" here
app.get(/.*/, (req, res) => {
  const indexPath = path.join(__dirname, "build", "index.html");

  // If build doesn't exist yet, show a helpful message instead of crashing
  if (!fs.existsSync(indexPath)) {
    return res
      .status(200)
      .send("React build not found. Run: cd frontend && npm run build, then copy build to backend/build");
  }

  return res.sendFile(indexPath);
});

// start server only after DB connects
(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
})();
