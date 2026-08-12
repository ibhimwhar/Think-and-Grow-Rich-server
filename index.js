const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { supabase } = require("./config/supabase.js");

dotenv.config();

const app = express();

const cors = require("cors");

app.use(
  cors({
    origin: "https://think-and-grow-rich-client.vercel.app",
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

// -----------------------
// In-memory data stores
// -----------------------

const Notes = [];
const Bookmarks = [];

let userTheme = {
  theme: "original",
};

// -----------------------
// Chapters
// -----------------------

app.get("/chapters", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .select("*");

    if (error) {
      console.error("Error fetching chapters:", error);

      return res.status(500).json({
        error: "Failed to fetch chapters",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// -----------------------
// Bookmarks
// -----------------------

app.get("/bookmarks", (req, res) => {
  res.status(200).json(Bookmarks);
});

// -----------------------
// Add bookmark
// -----------------------

app.post("/bookmarks/:chapterId", async (req, res) => {
  const { chapterId } = req.params;

  // Get the chapter FROM SUPABASE
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .single();

  if (error || !chapter) {
    return res.status(404).json({
      error: "Chapter not found",
    });
  }

  const alreadyBookmarked = Bookmarks.find(
    (bm) => bm.id === chapter.id
  );

  if (alreadyBookmarked) {
    return res.status(409).json({
      error: "Chapter already bookmarked",
    });
  }

  const bookmark = {
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
  };

  Bookmarks.push(bookmark);

  res.status(201).json(bookmark);
});

// -----------------------
// Delete bookmark
// -----------------------

app.delete("/bookmarks/:chapterId", (req, res) => {
  const { chapterId } = req.params;

  const index = Bookmarks.findIndex(
    (bookmark) => bookmark.id === chapterId
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Bookmark not found",
    });
  }

  Bookmarks.splice(index, 1);

  res.status(204).send();
});

// -----------------------
// Notes
// -----------------------

app.get("/notes", (req, res) => {
  res.status(200).json(Notes);
});

app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      error: "Title and content are required",
    });
  }

  const newNote = {
    id: uuidv4(),
    title,
    content,
  };

  Notes.push(newNote);

  res.status(201).json(newNote);
});

app.delete("/notes/:id", (req, res) => {
  const { id } = req.params;

  const noteIndex = Notes.findIndex(
    (note) => note.id === id
  );

  if (noteIndex === -1) {
    return res.status(404).json({
      error: "Note not found",
    });
  }

  Notes.splice(noteIndex, 1);

  res.status(204).send();
});

// -----------------------
// Theme
// -----------------------

app.post("/theme", (req, res) => {
  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({
      error: "Theme is required",
    });
  }

  userTheme.theme = theme;

  res.status(200).json({
    message: "Theme saved",
    theme,
  });
});

app.get("/theme", (req, res) => {
  res.status(200).json({
    theme: userTheme.theme,
  });
});

// -----------------------
// Start server
// -----------------------

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});