import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

function getLibsqlClient() {
  const url = process.env.TURSO_DATABASE_URL || '';
  const authToken = process.env.TURSO_AUTH_TOKEN || '';

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. ' +
      'Please set it to your Turso database URL (e.g., libsql://your-db-name-your-org.turso.io). ' +
      'Create a free database at https://turso.tech'
    );
  }

  // On Vercel (serverless), only web-compatible URLs work
  // On local dev, file: URLs need the Node.js client
  if (url.startsWith('file:')) {
    // Use the full Node.js client for local development
    try {
      // Dynamic require to avoid bundling issues on Vercel
      const { createClient: createNodeClient } = require('@libsql/client');
      return createNodeClient({ url, authToken: authToken || undefined });
    } catch {
      throw new Error(
        'Cannot use file: URLs in this environment. ' +
        'Set TURSO_DATABASE_URL to a libsql:// or https:// URL for Vercel deployment.'
      );
    }
  }

  // Web client for libsql://, https://, wss:// URLs (works on Vercel)
  return createClient({ url, authToken: authToken || undefined });
}

// Lazy singleton - don't create the client at module load time
// This prevents build-time crashes when env vars aren't available
let _client: ReturnType<typeof getLibsqlClient> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    _client = getLibsqlClient();
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
