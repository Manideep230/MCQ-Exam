import { MongoClient } from 'mongodb';
import { IOT_SECURITY_QUESTIONS } from '../src/db/iotSecurityQuestions';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manideepjuvvala215_db_user:o8qBudNZ3l42K3qU@cluster0.en0rmfg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mcq_exam_portal';

async function seedIoTExam() {
  console.log(`Connecting to MongoDB at: ${DB_NAME}...`);
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  const examsCol = db.collection<any>('exams');
  const questionsCol = db.collection<any>('questions');

  const examId = 'exam_iot_security_part_1';
  const now = new Date();
  const startDate = new Date(now.getTime() - 1000 * 60 * 30); // 30 minutes ago so it is immediately available
  const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60); // 60 days active

  console.log(`Upserting exam: "${examId}"...`);

  await examsCol.updateOne(
    { _id: examId },
    {
      $set: {
        title: 'IoT Security and IoT System Design Exam Part - 1',
        description: 'Comprehensive 120-question examination on IoT Security Fundamentals, Attacks & Threats, Authentication & Digital Certificates, Device & Firmware Security, Network Security, Secure Protocols, System Design, and Cloud Applications.',
        durationMinutes: 60,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        totalMarks: IOT_SECURITY_QUESTIONS.length,
        status: 'active',
        showResults: true,
        allowBackNav: true,
        abandonmentTimeoutSeconds: 60,
        updatedAt: now.toISOString(),
      },
      $setOnInsert: {
        createdAt: now.toISOString(),
      }
    },
    { upsert: true }
  );

  console.log(`Exam "${examId}" saved. Upserting ${IOT_SECURITY_QUESTIONS.length} questions...`);

  let count = 0;
  for (let i = 0; i < IOT_SECURITY_QUESTIONS.length; i++) {
    const q = IOT_SECURITY_QUESTIONS[i];
    const questionId = `q_iot120_${i + 1}`;

    await questionsCol.updateOne(
      { _id: questionId },
      {
        $set: {
          examId: examId,
          questionText: q.questionText,
          marks: 1,
          correctOption: q.correctOption,
          orderIndex: i + 1,
          options: q.options,
          updatedAt: now.toISOString(),
        },
        $setOnInsert: {
          createdAt: now.toISOString(),
        }
      },
      { upsert: true }
    );
    count++;
  }

  console.log(`✅ Successfully seeded ${count} questions for exam "${examId}".`);

  // Verify
  const examInDb = await examsCol.findOne({ _id: examId });
  const qCount = await questionsCol.countDocuments({ examId: examId });

  console.log('--- VERIFICATION ---');
  console.log('Exam title:', examInDb?.title);
  console.log('Duration:', examInDb?.durationMinutes, 'minutes');
  console.log('Total Marks:', examInDb?.totalMarks);
  console.log('Status:', examInDb?.status);
  console.log('Questions in DB:', qCount);

  await client.close();
  console.log('Done!');
}

seedIoTExam().catch((err) => {
  console.error('Seed IoT Error:', err);
  process.exit(1);
});
