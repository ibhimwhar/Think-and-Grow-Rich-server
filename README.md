# Think & Grow Rich — Backend

Express.js backend for the **Think & Grow Rich** reading application.

The backend is responsible for communicating with Supabase, serving book content to the frontend, and providing API endpoints for application features such as chapters, bookmarks, notes, and user preferences.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **Supabase**
* **PostgreSQL** — provided through Supabase
* **CORS**
* **dotenv**
* **UUID**

---

## Architecture

The application uses Supabase as the persistent database and Express.js as the API layer.

```text
                    Developer
                       │
                       │ seed.js
                       │
                       ▼
                 ┌───────────┐
                 │  Supabase │
                 │ Database  │
                 └─────┬─────┘
                       │
                       │ GET
                       ▼
                 ┌───────────┐
                 │ Express.js│
                 │    API    │
                 └─────┬─────┘
                       │
                       │ JSON
                       ▼
                 ┌───────────┐
                 │ Frontend  │
                 │ Next.js   │
                 └─────┬─────┘
                       │
                       ▼
                     Users
```

### Important

`seed.js` is a **developer-only script**.

It is used to initially upload the book data into Supabase.

The running Express server does **not** upload the book data every time it starts.

The normal application flow is:

```text
Supabase → Express → Frontend
```

---

# Project Structure

```text
Think-and-Grow-Rich-server/
│
├── config/
│   └── supabase.js
│
├── data.js
│
├── routes/
│   └── chapters.js
│
├── seed.js
│
├── server.js
│
├── .env — provide for yourself
├── .gitignore
├── package.json
└── README.md
```

---

# Requirements

Before running the backend, make sure you have:

* Node.js installed
* npm installed
* A Supabase project
* The Supabase project URL
* The Supabase service role key

---

# Installation

Clone the repository:

```bash
git clone https://github.com/ibhimwhar/Think-and-Grow-Rich-client.git
```

Navigate into the backend:

```bash
cd Think-and-Grow-Rich-server
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root of the backend:

Example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
```

## Security

**Never commit your `.env` file to GitHub.**

Add this to `.gitignore`:

```gitignore
node_modules/
.env
```

The `SUPABASE_SERVICE_ROLE_KEY` is a private server-side credential and must never be exposed to the frontend.

---

# Supabase Database

The backend expects a `chapters` table.

Example schema:

```sql
create table chapters (
  id uuid primary key,
  title text not null,
  description text not null,
  created_at timestamptz default now()
);
```

The chapter data is stored permanently in Supabase.

---

# Seeding the Database

The project contains a `data.js` file containing the book's chapter data.

Example:

```js
const Chapters = [
  {
    id: uuidv4(),
    title: "WHAT DO YOU WANT MOST?",
    description: `Chapter content...`,
  },
  {
    id: uuidv4(),
    title: "PUBLISHER'S PREFACE",
    description: `Chapter content...`,
  },
];

module.exports = { Chapters };
```

The `seed.js` script uploads this data to Supabase.

Run:

```bash
node seed.js
```

You should see:

```text
Starting database seed...
Successfully inserted 13 chapters.
```

After the data has been seeded, the application does not need to run `seed.js` again unless you add or update database content.

---

# Running the Backend

Start the Express server:

```bash
node server.js
```

You should see:

```text
Server is running on http://localhost:3000
```

The API will now be available at:

```text
http://localhost:3000
```

---

# Development Mode

For development, you can use `nodemon`.

Install it:

```bash
npm install --save-dev nodemon
```

Add this to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  }
}
```

Then start the development server with:

```bash
npm run dev
```

Seed the database with:

```bash
npm run seed
```

Start normally with:

```bash
npm start
```

---

# API Endpoints

## Chapters

### Get all chapters

```http
GET /chapters
```

Returns all chapters stored in Supabase.

Example response:

```json
[
  {
    "id": "uuid",
    "title": "WHAT DO YOU WANT MOST?",
    "description": "The Thirteen Steps to Riches..."
  },
  {
    "id": "uuid",
    "title": "PUBLISHER'S PREFACE",
    "description": "THIS book conveys..."
  }
]
```

The data comes directly from:

```text
Supabase
   ↓
Express
   ↓
GET /chapters
   ↓
Frontend
```

---

# Bookmarks

### Get bookmarks

```http
GET /bookmarks
```

### Add bookmark

```http
POST /bookmarks/:chapterId
```

### Delete bookmark

```http
DELETE /bookmarks/:chapterId
```

> Bookmarks are currently stored in memory and will be lost when the server restarts. They should eventually be moved into Supabase for persistent user-specific bookmarks.

---

# Notes

### Get notes

```http
GET /notes
```

### Create note

```http
POST /notes
```

Example request:

```json
{
  "title": "My Note",
  "content": "This chapter made me think about..."
}
```

### Delete note

```http
DELETE /notes/:id
```

> Notes are currently stored in memory and will be lost when the server restarts. Persistent notes should eventually be stored in Supabase.

---

# Theme

### Get current theme

```http
GET /theme
```

### Save theme

```http
POST /theme
```

Example request:

```json
{
  "theme": "dark"
}
```

> Theme preferences are currently stored in memory and should eventually be associated with authenticated users and stored in Supabase.

---

# Frontend Connection

The frontend communicates with the Express API rather than directly accessing the private Supabase service-role key.

Example frontend request:

```js
const response = await fetch(
  "http://localhost:3000/chapters"
);

const chapters = await response.json();
```

The complete flow is:

```text
Next.js Frontend
       │
       │ GET /chapters
       ▼
Express.js
       │
       │ SELECT
       ▼
Supabase
       │
       │ chapter data
       ▼
Express.js
       │
       │ JSON
       ▼
Next.js Frontend
```

---

# Database Seeding vs. Application Server

These are two separate processes.

## Database Seeding

Run this when you need to populate/update your book data:

```bash
npm run seed
```

Flow:

```text
data.js
   ↓
seed.js
   ↓
Supabase
```

## Running the Application

Run this when developing or running the actual application:

```bash
npm run dev
```

Flow:

```text
Frontend
   ↓
Express
   ↓
Supabase
```

The Express server should **not** insert the chapter data every time it starts.

---

# Recommended Development Workflow

### First setup

```bash
git clone https://github.com/ibhimwhar/Think-and-Grow-Rich-client.git
cd Think-and-Grow-Rich-server
npm install
```

Create `.env`:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Create the required Supabase tables.

Then seed the book:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Test the API:

```text
http://localhost:3000/chapters
```

If the chapters appear, the backend is working correctly.

---

# Current Backend Responsibilities

The backend currently handles:

* Supabase database connection
* Book chapter retrieval
* Database seeding
* Bookmark API
* Notes API
* Theme preferences
* CORS
* JSON API responses

---

# Future Improvements

The following features can be moved from in-memory storage to Supabase:

* User authentication
* Persistent bookmarks
* Persistent notes
* Reading progress
* User themes/preferences
* Chapter highlights
* User profiles
* Recently viewed chapters

A future database structure could look like:

```text
Supabase
│
├── users
├── chapters
├── bookmarks
├── notes
├── reading_progress
├── highlights
└── user_preferences
```

This will allow user data to persist between sessions and across devices.

---

# Security

Never expose:

```env
SUPABASE_SERVICE_ROLE_KEY
```

to the frontend.

The service role key must remain on the Express server.

The frontend should communicate with:

```text
Frontend → Express API → Supabase
```

and never receive the service role key.