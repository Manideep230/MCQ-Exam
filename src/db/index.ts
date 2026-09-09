import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manideepjuvvala215_db_user:o8qBudNZ3l42K3qU@cluster0.en0rmfg.mongodb.net/';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mcq_exam_portal';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

// Collection names
export const COLLECTIONS = {
  admins: 'admins',
  students: 'students',
  exams: 'exams',
  questions: 'questions',
  attempts: 'attempts',
  answers: 'answers',
  examEvents: 'exam_events',
} as const;
