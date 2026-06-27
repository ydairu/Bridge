// Firebase Cleanup Script
// Run this script to remove all seeded test data
// Usage: node cleanup-seed-data.cjs

const admin = require('firebase-admin');
const serviceAccount = require('./firebase_private_key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Helper function to delete collection in batches
async function deleteCollection(collectionName, batchSize = 100) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`  ✓ Deleted ${snapshot.size} documents`);

    // Recurse on the next process tick to avoid stack overflow
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function deleteAllAuthUsers() {
  let deletedCount = 0;
  const listAllUsers = async (nextPageToken) => {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    const deletePromises = listUsersResult.users.map(userRecord =>
      auth.deleteUser(userRecord.uid).then(() => {
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(`  ✓ Deleted ${deletedCount} auth accounts...`);
        }
      })
    );
    await Promise.all(deletePromises);
    if (listUsersResult.pageToken) {
      await listAllUsers(listUsersResult.pageToken);
    }
  };

  try {
    await listAllUsers();
    console.log(`  ✓ Total auth accounts deleted: ${deletedCount}`);
  } catch (error) {
    console.error('  ✗ Error deleting auth users:', error.message);
  }
}

// Cleanup function
async function cleanupDatabase() {
  console.log('\n🧹 Starting database cleanup...\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n⚠️  WARNING: This will delete ALL data from the following collections:');
  console.log('   • users');
  console.log('   • jobs');
  console.log('   • applications');
  console.log('   • quizzes');
  console.log('   • chatRooms');
  console.log('   • spellingQuizzes');
  console.log('   • chats');
  console.log('   • reviews');
  console.log('   • earnedBadges');
  console.log('   • candidateReviews');
  console.log('   • quizResults');
  console.log('   • userStats');
  console.log('\n⏳ Starting cleanup in 5 seconds... (Press Ctrl+C to cancel)');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const collections = [
      'users',
      'jobs',
      'applications',
      'quizzes',
      'chatRooms',
      'spellingQuizzes',
      'chats',
      'reviews',
      'earnedBadges',
      'candidateReviews',
      'quizResults',
      'userStats'
    ];

    for (const name of collections) {
      console.log(`\n🗑️  Deleting ${name}...`);
      await deleteCollection(name).catch(() => console.log('  (collection may be empty)'));
    }

    console.log('\n🗑️  Deleting Firebase Auth accounts...');
    await deleteAllAuthUsers();
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('   All seeded test data and auth accounts have been removed.\n');
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
  } finally {
    process.exit();
  }
}

// Run the cleanup
cleanupDatabase();

