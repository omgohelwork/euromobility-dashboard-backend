import dotenv from 'dotenv';

// Load env (Vercel sets env in dashboard; dotenv for local/serverless dev)
dotenv.config({ path: '.env.local' });
dotenv.config();

import app from '../src/app.js';

export default app;
