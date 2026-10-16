import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manideepjuvvala215_db_user:o8qBudNZ3l42K3qU@cluster0.en0rmfg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mcq_exam_portal';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    try {
      await cachedClient.connect();
    } catch (err: any) {
      cachedClient = null;
      if (err?.message?.includes('SSL alert') || err?.message?.includes('tlsv1 alert') || err?.name === 'MongoServerSelectionError') {
        throw new Error('MongoDB Connection Error: Please add 0.0.0.0/0 to Network Access IP Whitelist in MongoDB Atlas Dashboard.');
      }
      throw err;
    }
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
  feedbacks: 'feedbacks',
  feedbackSettings: 'feedback_settings',
} as const;
