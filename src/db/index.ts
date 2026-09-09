import { createClient as createWebClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

function getLibsqlClient() {
  const isWebUrl = url.startsWith('libsql://') || 
                   url.startsWith('https://') || 
                   url.startsWith('http://') || 
                   url.startsWith('wss://') || 
                   url.startsWith('ws://');

  if (isWebUrl) {
    return createWebClient({ url, authToken });
  }

  // If on Vercel Serverless without Turso URL
  if (process.env.VERCEL) {
    throw new Error(
      'TURSO_DATABASE_URL environment variable is missing in Vercel project settings. ' +
      'Please add TURSO_DATABASE_URL (e.g. libsql://your-db.turso.io) and TURSO_AUTH_TOKEN in Vercel Settings -> Environment Variables.'
    );
  }

  // Local Node.js file fallback
  try {
    const { createClient: createNodeClient } = require('@libsql/client');
    return createNodeClient({ url, authToken });
  } catch (e) {
    return createWebClient({ url, authToken });
  }
}

const client = getLibsqlClient();

export const db = drizzle(client, { schema });
