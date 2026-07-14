# Desk — Blog Uploader (no DB)

A minimal Node.js + Express backend that saves each blog post as its own
`.json` file on disk. No database required.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000

## How it works

- Frontend: single page (`public/index.html`) with a form (title, author, body)
  and a list of published posts.
- Backend: `server.js` exposes a small REST API and writes each post to
  `data/<timestamp>-<slug>.json`.

## API

| Method | Route          | Description                                               |
|--------|----------------|-------------------------------------------------------------|
| POST   | /api/blogs     | Create a post (title, content required; author optional)  |
| GET    | /api/blogs     | List all posts, newest first                               |
| GET    | /api/blogs/:id | Get a single post                                          |
| DELETE | /api/blogs/:id | Delete a post                                              |

Each post is stored as:
```json
{
  "id": "1784044316083-hello-world",
  "title": "Hello World",
  "author": "Ada",
  "content": "This is my first post.",
  "createdAt": "2026-07-14T15:51:56.083Z"
}
```
