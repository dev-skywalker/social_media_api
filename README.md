# Social Media API

A RESTful API built with NestJS, Prisma, and MySQL for a social media application with features like user authentication, posts, comments, and reactions.

## Features

- User authentication (register, login, logout) with JWT
- User profile management
- Create, read, update, and delete posts
- Image upload for posts
- Comments on posts
- Reactions (likes) on posts
- Pagination support

## Tech Stack

- **Framework**: NestJS with Fastify
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: Zod
- **Password Hashing**: Bcrypt
- **File Upload**: Fastify Multipart

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/social_media_db"
JWT_SECRET="your-secret-key-here"
```

Replace `username`, `password`, and database name with your MySQL credentials.

### 4. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npx prisma db seed
```

This creates two demo users:
- Email: `alice@example.com`, Password: `12345678`
- Email: `bob@example.com`, Password: `12345678`

### 6. Run the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:8080`

## Database Schema

### ERD Overview

```
User (1) ──── (N) Post (1) ──── (N) Comment
 │                   │
 └───── (N) Reaction ┘
```

### Tables

#### users
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT    |
| name       | VARCHAR(191) | NOT NULL                       |
| email      | VARCHAR(191) | NOT NULL, UNIQUE               |
| password   | VARCHAR(191) | NOT NULL                       |
| created_at | DATETIME(3)  | DEFAULT CURRENT_TIMESTAMP      |

#### posts
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT    |
| title      | VARCHAR(191) | NOT NULL                       |
| content    | TEXT         | NOT NULL                       |
| image      | VARCHAR(191) | NULL                           |
| created_at | DATETIME(3)  | DEFAULT CURRENT_TIMESTAMP      |
| userId     | INT          | FOREIGN KEY → users(id)        |

#### comments
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT    |
| content    | TEXT         | NOT NULL                       |
| created_at | DATETIME(3)  | DEFAULT CURRENT_TIMESTAMP      |
| userId     | INT          | FOREIGN KEY → users(id)        |
| postId     | INT          | FOREIGN KEY → posts(id)        |

#### reactions
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT    |
| created_at | DATETIME(3)  | DEFAULT CURRENT_TIMESTAMP      |
| userId     | INT          | FOREIGN KEY → users(id)        |
| postId     | INT          | FOREIGN KEY → posts(id)        |

**Unique Constraint**: `(userId, postId)` - A user can only react once per post

### Migration Scripts

Migration files are located in `prisma/migrations/`. To apply migrations:

```bash
npx prisma migrate deploy
```

### Seed Script

Seed file: `prisma/seed.ts`

Run seeder:
```bash
npx prisma db seed
```

## API Documentation

Base URL: `http://localhost:8080`

### Authentication

All endpoints except root, `/api/register`, and `/api/login` require authentication via JWT Bearer token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### Endpoints

#### **GET /**
Get API status message

**Response:**
```json
{
  "message": "Hello Social Api"
}
```

---

#### **POST /api/register**
Register a new user

**Request Body:**
```json
{
  "name": "Pyae Sone",
  "email": "pyaesone@gmail.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Pyae Sone",
  "email": "pyaesone@gmail.com",
  "createdAt": "2025-10-02T10:30:00.000Z"
}
```

---

#### **POST /api/login**
Login user

**Request Body:**
```json
{
  "email": "pyaesone@gmail.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Pyae Sone",
    "email": "pyaesone@gmail.com"
  }
}
```

---

#### **POST /api/logout** 🔒
Logout user (requires authentication)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### **GET /api/profile** 🔒
Get current user profile

**Response (200):**
```json
{
  "id": 1,
  "name": "Pyae Sone",
  "email": "pyaesone@gmail.com",
  "createdAt": "2025-10-02T10:30:00.000Z",
  "posts": [...]
}
```

---

### Posts

#### **POST /api/posts** 🔒
Create a new post

**Request Body (JSON):**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post"
}
```

**Request Body (Multipart/Form-Data for image upload):**
```
title: "My First Post"
content: "This is the content of my post"
image: [file]
```

**Response (201):**
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my post",
  "image": "/uploads/1234567890-image.jpg",
  "userId": 1,
  "createdAt": "2025-10-02T10:30:00.000Z"
}
```

---

#### **GET /api/posts** 🔒
Get all posts (paginated)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example:** `GET /api/posts?page=1&limit=10`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content",
      "image": null,
      "createdAt": "2025-10-02T10:30:00.000Z",
      "author": {
        "id": 1,
        "name": "Pyae Sone",
        "email": "pyaesone@gmail.com"
      },
      "comments": [...],
      "reactions": [...],
      "_count": {
        "reactions": 5,
        "comments": 3
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

#### **GET /api/posts/my-posts** 🔒
Get current user's posts (paginated)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example:** `GET /api/posts/my-posts?page=1&limit=10`

**Response (200):**
```json
{
  "data": [...],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### **PUT /api/posts/:postId** 🔒
Update a post (only post author can update)

**Request Body (JSON):**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Request Body (Multipart for image update):**
```
title: "Updated Title"
content: "Updated content"
image: [file]
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content",
  "image": "/uploads/new-image.jpg",
  "userId": 1,
  "createdAt": "2025-10-02T10:30:00.000Z"
}
```

---

#### **DELETE /api/posts/:postId** 🔒
Delete a post (only post author can delete)

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

---

### Comments

#### **POST /api/posts/:postId/comments** 🔒
Add a comment to a post

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

**Response (201):**
```json
{
  "id": 1,
  "content": "This is a comment",
  "userId": 1,
  "postId": 1,
  "createdAt": "2025-10-02T10:30:00.000Z",
  "author": {
    "id": 1,
    "name": "Pyae Sone",
    "email": "pyaesone@gmail.com"
  }
}
```

---

### Reactions

#### **POST /api/posts/:postId/reaction** 🔒
Toggle reaction (like/unlike) on a post

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "message": "Reaction added"
}
```

or

```json
{
  "message": "Reaction removed"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Uploads

Uploaded images are stored in the `uploads/` directory and served at `/uploads/<filename>`.

Access uploaded images: `http://localhost:8080/uploads/<filename>`

## CORS Configuration

Allowed origins:
- `http://localhost:3000`
- `https://social-api.pyaesone.com`
- `https://social.pyaesone.com`

## Testing

Run tests:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

UNLICENSED
