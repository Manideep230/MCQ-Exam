import { createClient as createWebClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

function getLibsqlClient() {
  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    return createWebClient({ url, authToken });
  }
  try {
    const { createClient: createNodeClient } = require('@libsql/client');
    return createNodeClient({ url, authToken });
  } catch (e) {
    return createWebClient({ url, authToken });
  }
}

const client = getLibsqlClient();

export const db = drizzle(client, { schema });
