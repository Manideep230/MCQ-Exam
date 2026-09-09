import { db } from './index';
import { admins, students, exams, questions, options } from './schema';
import { hashPassword } from '../lib/password';
import { eq } from 'drizzle-orm';

const SPECIFIC_ROLL_NUMBERS = [
  // List 1 (13 Roll Numbers)
  '23341A0206',
  '23341A0219',
  '23341A0221',
  '23341A0225',
  '23341A0227',
  '23341A0228',
  '23341A0229',
  '23341A0232',
  '23341A0236',
  '23341A0252',
  '23341A0253',
  '23341A0264',
  '24345A0203',

  // List 2 (34 Roll Numbers)
  '23341A0404',
  '23341A0413',
  '23341A0462',
  '23341A0480',
  '23341A0487',
  '23341A0499',
  '23341A04A4',
  '23341A04A8',
  '23341A04B0',
  '23341A04B1',
  '23341A04B9',
  '23341A04C7',
  '23341A04C9',
  '23341A04D1',
  '23341A04D3',
  '23341A04D4',
  '23341A04D5',
  '23341A04D8',
  '23341A04E0',
  '23341A04E1',
  '23341A04F1',
  '23341A04F5',
  '23341A04F6',
  '23341A04F7',
  '23341A04G0',
  '23341A04G1',
  '23341A04G2',
  '23341A04G4',
  '23341A04G6',
  '23341A04G9',
  '23341A04H0',
  '23341A04H7',
  '23341A04H8',
  '23341A04I2',
];

const MONGODB_QUESTIONS = [
  {
    text: "A college has a `students` collection. A new student record needs to be added to the database. Which operation would be appropriate?",
    options: { A: "Retrieve an existing document", B: "Add a new document to the collection", C: "Remove an existing document", D: "Arrange documents in order" },
    correct: "B"
  },
  {
    text: "A developer receives the following new customer information:\nName: Ravi\nAge: 21\nCity: Vijayawada\nThe information does not already exist in the `customers` collection. What is the most appropriate operation?",
    options: { A: "Insert", B: "Delete", C: "Sort", D: "Update" },
    correct: "A"
  },
  {
    text: "An administrator connects to a MongoDB server and wants to know which databases are currently available. Which operation should the administrator use?",
    options: { A: "Show collections", B: "Show databases", C: "Find documents", D: "Sort databases" },
    correct: "B"
  },
  {
    text: "Inside the `college` database, there are collections named `students`, `faculty`, and `courses`. An administrator wants to see these collection names. Which operation is appropriate?",
    options: { A: "Show databases", B: "Show collections", C: "Find", D: "Update many" },
    correct: "B"
  },
  {
    text: "A MongoDB database contains collections for `products`, `orders`, and `customers`. The developer wants to confirm the available collections before querying one of them. Which operation is suitable?",
    options: { A: "Show collections", B: "Show databases", C: "Delete many", D: "Update one" },
    correct: "A"
  },
  {
    text: "A teacher wants to add exactly one new student to the `students` collection. Which type of operation is most appropriate?",
    options: { A: "Insert one document", B: "Insert multiple documents", C: "Delete one document", D: "Update multiple documents" },
    correct: "A"
  },
  {
    text: "A shop receives a single new product:\nProduct: Laptop\nPrice: 55000\nCategory: Electronics\nThe product needs to be added as one new document. Which operation should be used?",
    options: { A: "Insert one", B: "Insert many", C: "Delete one", D: "Update one" },
    correct: "A"
  },
  {
    text: "A college receives information about 50 new students and wants to add all of them to the `students` collection together. Which operation is most suitable?",
    options: { A: "Insert one", B: "Insert many", C: "Update one", D: "Delete one" },
    correct: "B"
  },
  {
    text: "A supermarket application receives the following three products at the same time: Mouse, Keyboard, Monitor. All three need to be added as new documents. Which operation would be most appropriate?",
    options: { A: "Insert one", B: "Insert many", C: "Update one", D: "Delete many" },
    correct: "B"
  },
  {
    text: "During a data migration, 1,000 customer documents need to be added to a MongoDB collection. Which approach best matches this requirement?",
    options: { A: "Add each existing document by updating it", B: "Insert the documents as a group", C: "Delete the existing collection", D: "Sort the documents before adding them" },
    correct: "B"
  },
  {
    text: "A student has requested that their particular record be removed from the `students` collection. Only that student's document should be removed. Which operation is appropriate?",
    options: { A: "Delete one", B: "Delete many", C: "Update many", D: "Insert many" },
    correct: "A"
  },
  {
    text: "A shop has one discontinued product that should be permanently removed from the `products` collection. Other products must remain unchanged. Which operation should be used?",
    options: { A: "Delete one", B: "Delete many", C: "Update one", D: "Insert one" },
    correct: "A"
  },
  {
    text: "A company wants to remove all employee documents whose status is \"Resigned\". Multiple documents may satisfy this condition. Which operation is suitable?",
    options: { A: "Delete one", B: "Delete many", C: "Update one", D: "Insert one" },
    correct: "B"
  },
  {
    text: "An online store wants to remove all products belonging to a discontinued category. There may be hundreds of matching products. What should be used?",
    options: { A: "Delete one", B: "Delete many", C: "Insert many", D: "Update one" },
    correct: "B"
  },
  {
    text: "A student collection contains 10,000 documents. A developer wants to display only the first 10 matching documents to avoid showing too many results at once. Which concept should be used?",
    options: { A: "Projection", B: "Limit", C: "Sort", D: "Delete many" },
    correct: "B"
  },
  {
    text: "An online store has thousands of products. The home page should display only 20 products from the query result. Which operation is appropriate?",
    options: { A: "Limit the returned documents", B: "Delete 20 documents", C: "Update 20 documents", D: "Project 20 fields" },
    correct: "A"
  },
  {
    text: "A teacher searches for students from the CSE branch but wants the result to display only 5 students initially. Which MongoDB concept helps restrict the number of returned documents?",
    options: { A: "Sort", B: "Limit", C: "Projection", D: "Insert many" },
    correct: "B"
  },
  {
    text: "A student document contains: Name, Roll Number, Age, Phone, Address, Password. The administrator wants to display only the student's name and roll number, without displaying unnecessary fields. Which concept is appropriate?",
    options: { A: "Projection", B: "Sorting", C: "Deletion", D: "Insertion" },
    correct: "A"
  },
  {
    text: "A hospital application stores many details about patients but the receptionist only needs to see: Patient Name, Patient ID. What should be used to return only the required fields?",
    options: { A: "Projection", B: "Limit", C: "Delete one", D: "Insert one" },
    correct: "A"
  },
  {
    text: "A company stores employee information including salary, address, phone number, department, and name. A public employee directory should show only the name and department. Which MongoDB concept is useful?",
    options: { A: "Projection", B: "Delete many", C: "Sort", D: "Update many" },
    correct: "A"
  },
  {
    text: "A teacher wants to display students according to their marks, from the highest marks to the lowest. Which operation should be applied to the query result?",
    options: { A: "Limit", B: "Sort", C: "Projection", D: "Delete" },
    correct: "B"
  },
  {
    text: "An online store wants to display products from the lowest price to the highest price. Which concept is appropriate?",
    options: { A: "Sort", B: "Projection", C: "Delete many", D: "Insert many" },
    correct: "A"
  },
  {
    text: "A college has thousands of student documents. An administrator wants to retrieve students belonging to the CSE branch. Which type of operation should be performed?",
    options: { A: "Find/query operation", B: "Insert operation", C: "Delete operation", D: "Sort-only operation" },
    correct: "A"
  },
  {
    text: "A developer wants to retrieve all products whose category is \"Electronics\". Which MongoDB operation is most appropriate?",
    options: { A: "Find", B: "Insert many", C: "Delete many", D: "Update one" },
    correct: "A"
  },
  {
    text: "A teacher wants to retrieve the student whose roll number is `23CSE101`. The student document already exists. What should be used?",
    options: { A: "Find/query", B: "Insert one", C: "Delete many", D: "Update many" },
    correct: "A"
  },
  {
    text: "A student changes their phone number. Only that student's document needs to be modified. Which operation is appropriate?",
    options: { A: "Update one", B: "Update many", C: "Insert one", D: "Delete many" },
    correct: "A"
  },
  {
    text: "A product's price has changed from ₹50,000 to ₹48,000. Only that particular product should be modified. Which operation should be used?",
    options: { A: "Update one", B: "Update many", C: "Insert many", D: "Delete one" },
    correct: "A"
  },
  {
    text: "A college wants to change the branch information for all students belonging to a particular old branch name. Multiple documents need to be modified. Which operation is appropriate?",
    options: { A: "Update one", B: "Update many", C: "Delete one", D: "Insert one" },
    correct: "B"
  },
  {
    text: "An online store increases the price of all products in a particular category by 10%. Many documents need to be changed. Which operation is most suitable?",
    options: { A: "Update one", B: "Update many", C: "Delete one", D: "Insert many" },
    correct: "B"
  },
  {
    text: "A teacher wants to find CSE students, display only their names and marks, arrange them from highest marks to lowest, and display only the first 10 students. Which combination of concepts is most appropriate?",
    options: { A: "Find + Projection + Sort + Limit", B: "Insert + Delete + Update", C: "Delete Many + Insert Many", D: "Update One + Delete One" },
    correct: "A"
  }
];

export async function seed() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminHash = await hashPassword(adminPassword);

  const existingAdmin = await db.select().from(admins).where(eq(admins.username, adminUsername));
  if (existingAdmin.length === 0) {
    await db.insert(admins).values({
      id: 'admin_1',
      username: adminUsername,
      passwordHash: adminHash,
    });
    console.log(`✅ Admin account created: Username="${adminUsername}"`);
  }

  // 2. Seed All Specific Student Roll Numbers (Password = Roll Number)
  for (const roll of SPECIFIC_ROLL_NUMBERS) {
    const passHash = await hashPassword(roll);
    const existing = await db.select().from(students).where(eq(students.rollNumber, roll));
    if (existing.length === 0) {
      await db.insert(students).values({
        id: `student_${roll}`,
        rollNumber: roll,
        passwordHash: passHash,
        profileCompleted: false, // Forces /first-login onboarding!
        accountStatus: 'active',
      });
      console.log(`✅ Student created: Roll="${roll}" | Password="${roll}"`);
    } else {
      await db.update(students).set({
        passwordHash: passHash,
      }).where(eq(students.rollNumber, roll));
      console.log(`🔄 Student updated: Roll="${roll}" | Password="${roll}"`);
    }
  }

  // 3. Seed MongoDB Basics Exam
  const examId = 'exam_mongodb_basics_1';
  const existingExam = await db.select().from(exams).where(eq(exams.id, examId));

  const now = new Date();
  const startDate = new Date(now.getTime() - 1000 * 60 * 30); // Started 30 mins ago
  const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // Active for 7 days

  if (existingExam.length === 0) {
    await db.insert(exams).values({
      id: examId,
      title: 'MongoDB Basics',
      description: 'Comprehensive evaluation of MongoDB core concepts including CRUD operations, sorting, projections, and limit clauses.',
      durationMinutes: 60,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      totalMarks: 30,
      status: 'active',
      showResults: true,
      allowBackNav: true,
      abandonmentTimeoutSeconds: 60,
    });
    console.log('✅ Exam created: "MongoDB Basics"');

    // 4. Seed Questions and Options
    for (let i = 0; i < MONGODB_QUESTIONS.length; i++) {
      const q = MONGODB_QUESTIONS[i];
      const questionId = `q_mongo_${i + 1}`;

      await db.insert(questions).values({
        id: questionId,
        examId: examId,
        questionText: q.text,
        marks: 1,
        correctOption: q.correct as 'A' | 'B' | 'C' | 'D',
        orderIndex: i + 1,
      });

      const optionEntries: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      for (const optKey of optionEntries) {
        await db.insert(options).values({
          id: `opt_${questionId}_${optKey}`,
          questionId: questionId,
          optionKey: optKey,
          optionText: q.options[optKey],
        });
      }
    }
    console.log(`✅ Seeded ${MONGODB_QUESTIONS.length} MongoDB Questions and options.`);
  }

  console.log(`🎉 Seeding finished successfully! Total Students Seeded: ${SPECIFIC_ROLL_NUMBERS.length}`);
}

// Run if called directly
seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
