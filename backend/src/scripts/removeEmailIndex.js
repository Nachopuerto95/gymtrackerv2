import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

/**
 * Script to remove the email index from the users collection
 * This fixes the issue where registration fails with "email null already exists"
 */
async function removeEmailIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    console.log('Current indexes on users collection:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if email index exists
    const emailIndexExists = indexes.some(index =>
      index.key && index.key.email !== undefined
    );

    if (emailIndexExists) {
      console.log('\nDropping email index...');

      // Try different possible email index names
      const possibleIndexNames = ['email_1', 'email_-1', 'email'];

      for (const indexName of possibleIndexNames) {
        try {
          await usersCollection.dropIndex(indexName);
          console.log(`✅ Successfully dropped index: ${indexName}`);
          break;
        } catch (error) {
          if (error.codeName === 'IndexNotFound') {
            console.log(`  Index ${indexName} not found, trying next...`);
          } else {
            console.error(`  Error dropping ${indexName}:`, error.message);
          }
        }
      }
    } else {
      console.log('\n✅ No email index found - nothing to drop');
    }

    // Show final indexes
    console.log('\nFinal indexes on users collection:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeEmailIndex();
