import mongoose from 'mongoose';
import connectMongoDB from '../src/lib/mongodb.js' assert { type: 'module' };

const OLD_COLLEGE_ID = '686d3769acc30d9db90cad17';
const NEW_COLLEGE_ID = '69b9791f9cadcf48041aec9f';

/**
 * Production-ready collegeId migration script
 * Updates ONLY documents where collegeId matches OLD_COLLEGE_ID
 * Logs modified counts and verification
 */
async function migrateCollegeId() {
  try {
    // 1. Validate ObjectIds
    const oldId = new mongoose.Types.ObjectId(OLD_COLLEGE_ID);
    const newId = new mongoose.Types.ObjectId(NEW_COLLEGE_ID);
    
    console.log(`🚀 Starting migration...`);
    console.log(`📤 Old College ID: ${OLD_COLLEGE_ID}`);
    console.log(`📥 New College ID: ${NEW_COLLEGE_ID}`);
    console.log('');

    // 2. Connect to MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB connected');

    // 3. Import models
    const Student = (await import('../src/models/Student.js')).default;
    const Attendance = (await import('../src/models/Attendance.js')).default;
    const Exam = (await import('../src/models/Exam.js')).default;

    // 4. Count documents BEFORE migration
    const beforeCounts = {
      students: await Student.countDocuments({ collegeId: oldId }),
      attendance: await Attendance.countDocuments({ collegeId: oldId }),
      exams: await Exam.countDocuments({ collegeId: oldId })
    };
    
    console.log('📊 BEFORE migration:');
    console.table(beforeCounts);
    console.log('');

    if (beforeCounts.students === 0 && beforeCounts.attendance === 0 && beforeCounts.exams === 0) {
      console.log('ℹ️  No documents found with old collegeId. Migration complete (no changes).');
      process.exit(0);
    }

    // 5. Start MongoDB transaction (optional safety)
    const session = await mongoose.startSession();
    let success = true;
    
    await session.withTransaction(async () => {
      // Update Students
      const studentResult = await Student.updateMany(
        { collegeId: oldId },
        { $set: { collegeId: newId } },
        { session }
      );
      
      // Update Attendance  
      const attendanceResult = await Attendance.updateMany(
        { collegeId: oldId },
        { $set: { collegeId: newId } },
        { session }
      );
      
      // Update Exams
      const examResult = await Exam.updateMany(
        { collegeId: oldId },
        { $set: { collegeId: newId } },
        { session }
      );

      console.log('✅ UPDATES completed:');
      console.log(`   👨‍🎓 Students: ${studentResult.modifiedCount}`);
      console.log(`   📋 Attendance: ${attendanceResult.modifiedCount}`);  
      console.log(`   📚 Exams: ${examResult.modifiedCount}`);
      console.log('');
    });

    // 6. Verify NO documents left with oldId
    const afterCounts = {
      students: await Student.countDocuments({ collegeId: oldId }),
      attendance: await Attendance.countDocuments({ collegeId: oldId }),
      exams: await Exam.countDocuments({ collegeId: oldId })
    };

    console.log('🔍 VERIFICATION (should be 0):');
    console.table(afterCounts);
    console.log('');

    if (afterCounts.students === 0 && afterCounts.attendance === 0 && afterCounts.exams === 0) {
      console.log('🎉 MIGRATION SUCCESSFUL! All documents updated.');
    } else {
      console.error('❌ Verification failed! Some documents still have old collegeId.');
      success = false;
    }

    await session.endSession();
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('💥 MIGRATION FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run migration
migrateCollegeId();

