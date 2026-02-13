import dotenv from 'dotenv';

// Load env (Vercel sets env in dashboard; dotenv for local/serverless dev)
dotenv.config({ path: '.env.local' });
dotenv.config();

import app from '../src/app.js';

/** Allow upload endpoint to run up to 60s on Vercel (avoids FUNCTION_INVOCATION_TIMEOUT). */
export const config = { maxDuration: 60 };

export default app;
