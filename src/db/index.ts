import { createClient as createWebClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

function getLibsqlClient() {
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const isWebUrl = url.startsWith('libsql://') || 
                   url.startsWith('https://') || 
                   url.startsWith('http://') || 
                   url.startsWith('wss://') || 
                   url.startsWith('ws://');

  if (isWebUrl) {
    return createWebClient({ url, authToken });
  }

  // Local Node.js file:local.db fallback (only works outside Vercel)
  try {
    const { createClient: createNodeClient } = require('@libsql/client');
    return createNodeClient({ url, authToken });
  } catch (e) {
    return createWebClient({ url, authToken });
  }
}

// Lazy singleton - don't create the client at module load time
// This prevents build-time crashes when env vars aren't available
let _client: ReturnType<typeof getLibsqlClient> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      _client = getLibsqlClient();
      _db = drizzle(_client, { schema });
    }
    return (_db as any)[prop];
  },
});
