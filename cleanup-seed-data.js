// Firebase Cleanup Script
// Run this script to remove all seeded test data
// Usage: node cleanup-seed-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase_private_key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
  console.log('\n⏳ Starting cleanup in 3 seconds... (Press Ctrl+C to cancel)');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    console.log('\n🗑️  Deleting users...');
    await deleteCollection('users');
    
    console.log('\n🗑️  Deleting jobs...');
    await deleteCollection('jobs');
    
    console.log('\n🗑️  Deleting applications...');
    await deleteCollection('applications');
    
    console.log('\n🗑️  Deleting quizzes...');
    await deleteCollection('quizzes');
    
    console.log('\n🗑️  Deleting chat rooms...');
    await deleteCollection('chatRooms');
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('   All seeded test data has been removed.\n');
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
  } finally {
    process.exit();
  }
}

// Run the cleanup
cleanupDatabase();

