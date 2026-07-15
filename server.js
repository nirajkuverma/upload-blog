const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
// DATA_DIR can be overridden with an env var, useful when mounting a
// persistent volume on Render/Railway/Fly.io at a specific path.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Make sure the data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Parses multipart/form-data (text fields only, no files kept in memory/disk)
const upload = multer();

app.use(express.static(path.join(__dirname, 'public')));

// Turn a title into a safe filename slug
function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60) || 'post';
}

// Create a new blog post -> saved as a .json file
// Expects multipart/form-data (e.g. a FormData object from the browser)
app.post('/api/blogs', upload.none(), (req, res) => {
  const { title, author, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const id = `${Date.now()}-${slugify(title)}`;
  const post = {
    id,
    title,
    author: author || 'Anonymous',
    content,
    createdAt: new Date().toISOString()
  };

  const filePath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2));

  res.status(201).json(post);
});

// List all blog posts (newest first)
app.get('/api/blogs', (req, res) => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file));
    return JSON.parse(raw);
  });

  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// Get a single blog post by id
app.get('/api/blogs/:id', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  const raw = fs.readFileSync(filePath);
  res.json(JSON.parse(raw));
});

// Delete a blog post
app.delete('/api/blogs/:id', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Blog uploader running at http://localhost:${PORT}`);
});
