import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { AdminDoc, StudentDoc, ExamDoc, QuestionDoc } from './schema';
import { PYTHON_BASICS_QUESTIONS } from './pythonBasicsQuestions';
import { IOT_SECURITY_QUESTIONS } from './iotSecurityQuestions';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manideepjuvvala215_db_user:o8qBudNZ3l42K3qU@cluster0.en0rmfg.mongodb.net/';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mcq_exam_portal';

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
  },

  // --- Questions 31 to 60 (Added from 30 Additional MCQ Question Bank) ---
  {
    text: "A developer has collected a new product's details and wants to add them as a new document to an existing `products` collection. The product does not currently exist. What should the developer do?",
    options: { A: "Retrieve the document", B: "Insert the new document", C: "Sort the collection", D: "Delete the collection" },
    correct: "B"
  },
  {
    text: "A school receives the following information for a newly admitted student:\nRoll No: 24CSE015\nName: Anil\nBranch: CSE\nThere is no existing document for this student. Which operation best represents the required database action?",
    options: { A: "Update", B: "Insert", C: "Delete", D: "Projection" },
    correct: "B"
  },
  {
    text: "An application receives information about exactly one new customer. The developer wants to create a single new document without affecting existing customers. Which operation is appropriate?",
    options: { A: "Insert one", B: "Insert many", C: "Delete many", D: "Update many" },
    correct: "A"
  },
  {
    text: "A library registers one newly arrived book:\nTitle: Database Systems\nAuthor: Kiran\nAvailable: Yes\nWhich operation should be used to add this single book as a new document?",
    options: { A: "Update one", B: "Insert one", C: "Delete one", D: "Insert many" },
    correct: "B"
  },
  {
    text: "A company imports employee information for 200 new employees from a file. All records need to be added to the `employees` collection. Which operation is most appropriate?",
    options: { A: "Insert one repeatedly as the preferred operation", B: "Insert many", C: "Update one", D: "Delete many" },
    correct: "B"
  },
  {
    text: "An online shopping application receives 25 new orders at the same time. None of these orders currently exists in the database. Which operation best fits the situation?",
    options: { A: "Delete many", B: "Update many", C: "Insert many", D: "Find" },
    correct: "C"
  },
  {
    text: "A MongoDB server is used by three different applications. An administrator wants to identify the databases available on the server before selecting one. Which operation is required?",
    options: { A: "Display available databases", B: "Display documents", C: "Update documents", D: "Delete documents" },
    correct: "A"
  },
  {
    text: "A developer is unsure whether a particular database exists on the MongoDB server. What is the most appropriate first step?",
    options: { A: "View the available databases", B: "Delete the suspected database", C: "Sort all documents", D: "Update all collections" },
    correct: "A"
  },
  {
    text: "A developer has selected the `company` database and wants to know whether it contains collections for `employees`, `departments`, and `projects`. What should the developer inspect?",
    options: { A: "Available databases", B: "Available collections", C: "Individual documents only", D: "Index values" },
    correct: "B"
  },
  {
    text: "An administrator has opened a database but does not know the names of the collections inside it. Which operation would provide this information?",
    options: { A: "Show collections", B: "Show databases", C: "Delete many", D: "Update one" },
    correct: "A"
  },
  {
    text: "A university stores thousands of student documents. The administrator wants to retrieve only students whose branch is `CSE`. Which operation is conceptually required?",
    options: { A: "Insert", B: "Find/query", C: "Delete", D: "Update" },
    correct: "B"
  },
  {
    text: "A customer wants to see their order history from an online shopping application. The orders already exist in MongoDB. What operation should the application perform?",
    options: { A: "Insert new orders", B: "Find the relevant order documents", C: "Delete old orders", D: "Update every order" },
    correct: "B"
  },
  {
    text: "A teacher wants to locate all students who scored more than 80 marks. The student records already exist. What should the application perform?",
    options: { A: "A query to retrieve matching documents", B: "An insertion operation", C: "A deletion operation", D: "An update operation on every document" },
    correct: "A"
  },
  {
    text: "A customer accidentally created a duplicate account. The administrator has identified the exact duplicate document and wants to remove only that record. What is appropriate?",
    options: { A: "Delete one", B: "Delete many", C: "Update many", D: "Insert many" },
    correct: "A"
  },
  {
    text: "A library database contains a book that has been entered incorrectly. The administrator wants to remove that particular document while keeping all other books. Which operation is suitable?",
    options: { A: "Delete many", B: "Delete one", C: "Update many", D: "Insert one" },
    correct: "B"
  },
  {
    text: "An organization wants to remove all temporary employee records whose employment status is `Temporary`. Hundreds of documents may match the condition. Which operation is appropriate?",
    options: { A: "Delete one", B: "Delete many", C: "Update one", D: "Find one" },
    correct: "B"
  },
  {
    text: "An e-commerce company wants to remove all products that are marked as discontinued. There may be thousands of such products. What is the most suitable operation?",
    options: { A: "Delete one", B: "Delete many", C: "Insert many", D: "Update one" },
    correct: "B"
  },
  {
    text: "A news website retrieves thousands of articles but wants to display only the first 10 articles on the current page. Which concept should be used?",
    options: { A: "Projection", B: "Limit", C: "Delete", D: "Update" },
    correct: "B"
  },
  {
    text: "A mobile application searches for restaurants but wants to show only 5 results initially to keep the screen simple. Which MongoDB concept is appropriate?",
    options: { A: "Limit the number of returned documents", B: "Delete the extra documents", C: "Update the extra documents", D: "Project the extra documents" },
    correct: "A"
  },
  {
    text: "A college database contains 5,000 student records. An administrator wants to retrieve only 20 matching records for the first page of a report. What should be applied to the query result?",
    options: { A: "Limit", B: "Delete", C: "Update", D: "Insert" },
    correct: "A"
  },
  {
    text: "A student document contains:\nName\nRoll Number\nBranch\nPhone\nAddress\nDate of Birth\nA public student directory should display only the student's name and branch. Which concept should be used?",
    options: { A: "Projection", B: "Sort", C: "Delete many", D: "Insert many" },
    correct: "A"
  },
  {
    text: "A company stores confidential employee information along with general employee details. A dashboard should display only the employee's name and department. What is the best approach?",
    options: { A: "Return only the required fields", B: "Delete confidential fields from the database", C: "Delete the employee documents", D: "Create duplicate employee documents" },
    correct: "A"
  },
  {
    text: "A hospital application stores complete patient records, but a waiting-room display should show only:\nPatient Name\nToken Number\nWhich MongoDB concept is most suitable?",
    options: { A: "Projection", B: "Limit", C: "Sort", D: "Update many" },
    correct: "A"
  },
  {
    text: "An online store wants customers to see the cheapest products first. The products are already stored in MongoDB. Which concept should be applied to the results?",
    options: { A: "Sort", B: "Projection", C: "Delete", D: "Insert" },
    correct: "A"
  },
  {
    text: "A teacher wants to generate a report in which students appear from the highest marks to the lowest marks. Which operation is required?",
    options: { A: "Limit", B: "Sort", C: "Projection", D: "Delete one" },
    correct: "B"
  },
  {
    text: "A company wants its employee list arranged alphabetically by employee name. Which database operation is appropriate?",
    options: { A: "Sort", B: "Insert many", C: "Delete many", D: "Update one" },
    correct: "A"
  },
  {
    text: "A student's phone number has changed. The student's existing document should be modified, while all other student documents remain unchanged. Which operation is appropriate?",
    options: { A: "Insert one", B: "Update one", C: "Update many", D: "Delete many" },
    correct: "B"
  },
  {
    text: "An online store discovers that one product has an incorrect price. Only that product's price needs to be changed. Which operation should be used?",
    options: { A: "Update one", B: "Update many", C: "Insert many", D: "Delete many" },
    correct: "A"
  },
  {
    text: "A university changes the name of a branch, and all existing student documents containing the old branch name need to be changed. Which operation is appropriate?",
    options: { A: "Update one", B: "Update many", C: "Delete one", D: "Insert one" },
    correct: "B"
  },
  {
    text: "An online store wants to mark all products in a particular category as \"Out of Stock\" because the warehouse has run out of them. Multiple product documents need to be modified. Which operation is most suitable?",
    options: { A: "Update one", B: "Update many", C: "Delete one", D: "Insert many" },
    correct: "B"
  }
];

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  console.log('🌱 Starting MongoDB database seeding...');

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`📦 Connected to MongoDB: ${DB_NAME}`);

  // 1. Seed Admin
  const adminsCol = db.collection<AdminDoc>('admins');
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminHash = await hashPassword(adminPassword);

  const existingAdmin = await adminsCol.findOne({ _id: adminUsername } as any);
  if (!existingAdmin) {
    await adminsCol.insertOne({
      _id: adminUsername,
      username: adminUsername,
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Admin account created: Username="${adminUsername}"`);
  } else {
    await adminsCol.updateOne({ _id: adminUsername } as any, { $set: { passwordHash: adminHash } });
    console.log(`🔄 Admin password updated: Username="${adminUsername}"`);
  }

  // 2. Seed Students
  const studentsCol = db.collection<StudentDoc>('students');
  for (const roll of SPECIFIC_ROLL_NUMBERS) {
    const passHash = await hashPassword(roll);
    const studentId = `student_${roll}`;
    const existing = await studentsCol.findOne({ _id: studentId } as any);

    if (!existing) {
      await studentsCol.insertOne({
        _id: studentId,
        rollNumber: roll,
        passwordHash: passHash,
        fullName: null,
        branch: null,
        collegeName: null,
        profileCompleted: false,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Student created: Roll="${roll}" | Password="${roll}"`);
    } else {
      await studentsCol.updateOne({ _id: studentId } as any, { $set: { passwordHash: passHash } });
      console.log(`🔄 Student updated: Roll="${roll}" | Password="${roll}"`);
    }
  }

  // 3. Seed MongoDB Basics Exam (60 Questions, 60 Minutes)
  const examsCol = db.collection<ExamDoc>('exams');
  const questionsCol = db.collection<QuestionDoc>('questions');
  const examId = 'exam_mongodb_basics_1';

  const now = new Date();
  const startDate = new Date(now.getTime() - 1000 * 60 * 30); // Started 30 mins ago
  const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // Active for 30 days

  await examsCol.updateOne(
    { _id: examId },
    {
      $set: {
        title: 'MongoDB Basics',
        description: 'Comprehensive evaluation of MongoDB core concepts including CRUD operations, sorting, projections, and limit clauses.',
        durationMinutes: 60,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        totalMarks: MONGODB_QUESTIONS.length,
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
  console.log(`✅ Exam updated/upserted: "MongoDB Basics" (${MONGODB_QUESTIONS.length} Questions, 60 Minutes)`);

  // 4. Upsert Questions (with embedded options)
  for (let i = 0; i < MONGODB_QUESTIONS.length; i++) {
    const q = MONGODB_QUESTIONS[i];
    const questionId = `q_mongo_${i + 1}`;

    await questionsCol.updateOne(
      { _id: questionId },
      {
        $set: {
          examId: examId,
          questionText: q.text,
          marks: 1,
          correctOption: q.correct,
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
  }
  console.log(`✅ Seeded/Upserted ${MONGODB_QUESTIONS.length} MongoDB Questions with embedded options.`);

  // 4b. Seed Python Basics 90 MCQs Exam
  const pyExamId = 'exam_python_basics_90';
  await examsCol.updateOne(
    { _id: pyExamId },
    {
      $set: {
        title: 'PYTHON BASICS — 90 MCQs',
        description: 'Comprehensive Python Basics MCQ exam covering Comments, Input, Data Types, Arithmetic/Comparison/Logical/Assignment Operators, Precedence, type(), Strings, Slicing, and Exceptions.',
        durationMinutes: 90,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        totalMarks: PYTHON_BASICS_QUESTIONS.length,
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

  for (let i = 0; i < PYTHON_BASICS_QUESTIONS.length; i++) {
    const q = PYTHON_BASICS_QUESTIONS[i];
    const questionId = `q_py90_${i + 1}`;

    await questionsCol.updateOne(
      { _id: questionId },
      {
        $set: {
          examId: pyExamId,
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
  }
  console.log(`✅ Seeded/Upserted ${PYTHON_BASICS_QUESTIONS.length} Python Basics Questions with 8 options each.`);

  // 4c. Seed IoT Security and IoT System Design Exam Part - 1 (120 MCQs)
  const iotExamId = 'exam_iot_security_part_1';
  await examsCol.updateOne(
    { _id: iotExamId },
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

  for (let i = 0; i < IOT_SECURITY_QUESTIONS.length; i++) {
    const q = IOT_SECURITY_QUESTIONS[i];
    const questionId = `q_iot120_${i + 1}`;

    await questionsCol.updateOne(
      { _id: questionId },
      {
        $set: {
          examId: iotExamId,
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
  }
  console.log(`✅ Seeded/Upserted ${IOT_SECURITY_QUESTIONS.length} IoT Security Questions with 8 options each.`);

  // 5. Create indexes for performance
  await studentsCol.createIndex({ rollNumber: 1 }, { unique: true });
  await questionsCol.createIndex({ examId: 1 });
  await db.collection('attempts').createIndex({ examId: 1, studentId: 1 });
  await db.collection('attempts').createIndex({ studentId: 1 });
  await db.collection('answers').createIndex({ attemptId: 1 });
  await db.collection('answers').createIndex({ attemptId: 1, questionId: 1 }, { unique: true });
  await db.collection('exam_events').createIndex({ attemptId: 1 });
  console.log('✅ Database indexes created.');

  console.log(`🎉 Seeding finished successfully! Total Students Seeded: ${SPECIFIC_ROLL_NUMBERS.length}`);

  await client.close();
}

seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
