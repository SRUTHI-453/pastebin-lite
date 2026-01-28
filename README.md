# Ephemeral Paste – Pastebin Lite

A lightweight pastebin application that allows users to create and share text pastes with optional expiry constraints.

## Project Description

Ephemeral Pastee is a web application built with Node.js that enables users to:
- Create text pastes and receive shareable URLs
- Set optional time-based expiry (TTL) on pastes
- Set optional view-count limits on pastes
- View pastes through a clean web interface

## Persistence Layer

This application uses **Vercel KV (Redis)** as its persistence layer.

**Why Vercel KV?**
- Durable storage that persists across serverless function invocations
- Built-in support for TTL (Time To Live) for automatic expiry
- Atomic operations for view counting to prevent race conditions
- Low latency for fast paste retrieval
- Seamless integration with Vercel deployment platform

**Data Schema:**
Each paste is stored as a JSON object in Redis with the following structure:
```json
{
  "content": "paste text content",
  "max_views": 10,
  "view_count": 0,
  "created_at": 1640000000000,
  "expires_at": 1640003600000
}
```

## Running Locally

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)

### Installation Steps

1. Clone the repository:
```bash
git clone <your-repository-url>
cd pastebin-lite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following:

```env
# Vercel KV Configuration
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Optional: Enable test mode for deterministic time testing
TEST_MODE=0
```

**Getting Vercel KV credentials:**
- Create a project on Vercel
- Add a KV database from the Storage tab
- Copy the KV_REST_API_URL and KV_REST_API_TOKEN from the .env.local tab

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## API Documentation

### Health Check
**GET** `/api/healthz`

Returns the health status of the application.

**Response:**
```json
{
  "ok": true
}
```

### Create Paste
**POST** `/api/pastes`

Creates a new paste with optional constraints.

**Request Body:**
```json
{
  "content": "Your text content here",
  "ttl_seconds": 3600,
  "max_views": 10
}
```

- `content` (required): Non-empty string
- `ttl_seconds` (optional): Integer ≥ 1
- `max_views` (optional): Integer ≥ 1

**Response:**
```json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

### Get Paste (API)
**GET** `/api/pastes/:id`

Retrieves paste content and metadata. Each successful fetch counts as a view.

**Response:**
```json
{
  "content": "Your text content here",
  "remaining_views": 9,
  "expires_at": "2026-01-29T12:00:00.000Z"
}
```

- `remaining_views`: `null` if unlimited
- `expires_at`: `null` if no TTL

**Error Response (404):**
```json
{
  "error":"Expired"
  }
```

### View Paste (HTML)
**GET** `/p/:id`

Displays the paste content in a web page. Returns 404 if paste is unavailable.

## Important Design Decisions

### 1. ID Generation
Using `crypto` library to generate id, URL-safe, unique identifiers. This provides good collision resistance while keeping URLs short.

### 2. View Counting with Atomic Operations
View counts are incremented atomically in Redis to prevent race conditions under concurrent access. The application checks constraints before incrementing to ensure pastes don't exceed their limits.

### 3. TTL Handling Strategy
- **Redis TTL**: Primary mechanism for automatic cleanup
- **Application-level checks**: Additional validation for precise expiry logic, especially in test mode
- **Test Mode**: When `TEST_MODE=1`, the `x-test-now-ms` header overrides system time for deterministic testing

### 4. Error Handling
All unavailable paste scenarios (not found, expired, view limit exceeded) return consistent HTTP 404 responses with JSON error bodies for the API and appropriate HTML pages for browser views.

### 5. XSS Prevention
Paste content is HTML-escaped before rendering to prevent script injection attacks. User input is never executed as code.

### 6. Serverless-Friendly Architecture
No global mutable state is used. Each request is stateless, making the application compatible with serverless platforms like Vercel.

### 7. Constraint Resolution
When both TTL and max_views are set, the paste becomes unavailable as soon as either constraint is triggered (whichever happens first).

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect Node.js configuration
4. Add a Vercel KV database from the Storage tab
5. Environment variables will be automatically configured
6. Deploy!

Your application will be available at `https://your-app.vercel.app`

## Testing

The application supports deterministic time testing for automated test suites:

- Set environment variable: `TEST_MODE=1`
- Send requests with header: `x-test-now-ms: <milliseconds-since-epoch>`
- The application will treat this timestamp as the current time for expiry logic

## Technologies Used

- **Node.js 20**: React framework with API routes
- **TypeScript**: Type-safe development
- **Vercel KV**: Redis-compatible serverless database
- **Tailwind CSS**: Utility-first CSS framework
- **crypto**: Unique ID generation

## License

MIT