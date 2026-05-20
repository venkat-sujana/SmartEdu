import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/osra';
const client = new MongoClient(uri);

const generalStreams = ['MPC', 'BIPC', 'CEC', 'HEC'];
const vocationalStreams = ['M&AT', 'MLT', 'CET'];

const generateStudents = (stream, count) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Student ${stream} ${i + 1}`,
    group: stream,
    academicYear: '2025-2026',
    examType: 'UNIT-1',
    marks: Math.floor(Math.random() * 100),
  }));
};

const insertSampleData = async () => {
  try {
    await client.connect();
    const db = client.db();
    const studentsCollection = db.collection('students');

    const generalStudents = generalStreams.flatMap((stream) => generateStudents(stream, 10));
    const vocationalStudents = vocationalStreams.flatMap((stream) => generateStudents(stream, 10));

    const allStudents = [...generalStudents, ...vocationalStudents];

    const result = await studentsCollection.insertMany(allStudents);
    console.log(`Inserted ${result.insertedCount} students successfully.`);
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await client.close();
  }
};

insertSampleData();