# Upload on Vercel – Fix "timeout of 30000ms exceeded"

## Cause

The message **"timeout of 30000ms exceeded"** comes from the **frontend** (e.g. axios/fetch default 30s), not from Vercel. On the first request after deploy (cold start), the server must:

1. Start the serverless function  
2. Connect to MongoDB (can take 5–15s if Atlas is in another region)  
3. Then run the upload logic  

So the **total** time can go over 30s even when the backend is optimized.

## Backend changes (already done)

- Upload uses **one** `Data.bulkWrite` for all files (no per-file DB writes).
- **One** YearControl update for all years.
- No range recalculation in the upload request.
- MongoDB connection uses `serverSelectionTimeoutMS: 15000` and `connectTimeoutMS: 10000`.

## What the frontend must do

**Set a longer timeout for `POST /api/upload`** so the client does not give up before the server answers.

Examples:

- **Axios:**  
  `axios.post(url, formData, { timeout: 90000 })`  // 90 seconds

- **Fetch:**  
  Use `AbortController` with a 90s timeout, or a wrapper that rejects after 90s.

Recommendation: **90 seconds** for the upload request. For **recalculate-bulk** after upload, 60–90s is also fine.

## Optional: warm the function first

To reduce the chance of timeout on the **first** upload after deploy:

1. Call **`GET /api/health`** (or any light GET) right before opening the upload screen.  
2. Then start the upload.  
   The same serverless instance may be reused, so the upload request may skip cold start and DB connection time.

## Summary

| Request                  | Suggested client timeout |
|--------------------------|---------------------------|
| `POST /api/upload`       | **90 seconds**            |
| `POST /api/indicators/recalculate-bulk` | **60–90 seconds** |

Without this, the frontend will keep showing "timeout of 30000ms exceeded" even when the backend would respond a few seconds later.
