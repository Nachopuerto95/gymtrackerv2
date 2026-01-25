import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Routine from '../models/Routine.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function fixUserIssues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB\n');

    // 1. Find user "nacho" and check routines
    console.log('=== Checking user "nacho" ===');
    const nachUser = await User.findOne({
      $or: [{ username: 'nacho' }, { name: 'nacho' }]
    });

    if (nachUser) {
      console.log(`Found user: ${nachUser.username} (${nachUser.name})`);
      console.log(`User ID: ${nachUser._id}`);
      console.log(`Active Routine ID: ${nachUser.activeRoutineId}\n`);

      // Find all routines for this user
      const nachRoutines = await Routine.find({ userId: nachUser._id });
      console.log(`Total routines: ${nachRoutines.length}`);

      nachRoutines.forEach((routine, index) => {
        console.log(`\n${index + 1}. ${routine.name}`);
        console.log(`   - ID: ${routine._id}`);
        console.log(`   - Active: ${routine.isActive}`);
        console.log(`   - Private: ${routine.isPrivate}`);
        console.log(`   - Created: ${routine.createdAt}`);
      });

      // Find the active routine
      // Find the active routine (check by ID from user's activeRoutineId)
      let activeRoutine = null;
      if (nachUser.activeRoutineId) {
        activeRoutine = await Routine.findById(nachUser.activeRoutineId);
      }

      if (activeRoutine) {
        console.log(`\n⚠️  Active routine: "${activeRoutine.name}"`);
        console.log(`   - Routine ID: ${activeRoutine._id}`);
        console.log(`   - Owner ID: ${activeRoutine.userId}`);
        console.log(`   - Creator ID: ${activeRoutine.createdBy}`);

        // Check if the routine belongs to this user
        if (activeRoutine.userId.toString() !== nachUser._id.toString()) {
          console.log(`\n❌ PROBLEM: Active routine does NOT belong to user!`);
          console.log(`   User ID: ${nachUser._id}`);
          console.log(`   Routine Owner ID: ${activeRoutine.userId}`);

          // Find who owns this routine
          const routineOwner = await User.findById(activeRoutine.userId);
          if (routineOwner) {
            console.log(`   Routine actually belongs to: ${routineOwner.name} (${routineOwner.username || 'no username'})`);
          }
        }

        // Check if it's a copy
        if (activeRoutine.name.includes('Copia')) {
          console.log(`   This is a copied routine. Looking for original...`);

          // Try to find non-copy routines
          const nonCopyRoutines = nachRoutines.filter(r =>
            !r.name.includes('Copia') && r._id.toString() !== activeRoutine._id.toString()
          );

          if (nonCopyRoutines.length > 0) {
            console.log(`\n   Found ${nonCopyRoutines.length} non-copy routine(s):`);
            nonCopyRoutines.forEach(r => {
              console.log(`   - ${r.name} (${r._id})`);
            });
          }
        }
      } else {
        console.log('\n✅ No active routine');
      }
    } else {
      console.log('❌ User "nacho" not found');
    }

    // 2. Change password for "nachopuerto"
    console.log('\n\n=== Changing password for "nachopuerto" ===');
    const nachopuertoUser = await User.findOne({
      $or: [{ username: 'nachopuerto' }, { name: 'nachopuerto' }]
    });

    if (nachopuertoUser) {
      console.log(`Found user: ${nachopuertoUser.username || 'no username'} (${nachopuertoUser.name})`);

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('popo89', salt);

      // Update password and username directly (bypass validation)
      const updateData = { password: hashedPassword };

      // Add username if missing
      if (!nachopuertoUser.username) {
        updateData.username = 'nachopuerto';
        console.log('ℹ️  Adding missing username: nachopuerto');
      }

      await User.findByIdAndUpdate(nachopuertoUser._id, updateData, {
        runValidators: false // Skip validators to avoid password hashing again
      });

      console.log('✅ Password changed successfully to: popo89');
      if (updateData.username) {
        console.log('✅ Username set to: nachopuerto');
      }
    } else {
      console.log('❌ User "nachopuerto" not found');

      // List all users
      console.log('\n📋 Available users:');
      const allUsers = await User.find({}).select('username name');
      allUsers.forEach(u => {
        console.log(`   - ${u.username} (${u.name})`);
      });
    }

    // 3. Delete user "nacho" and all their data
    console.log('\n\n=== Deleting user "nacho" ===');
    if (nachUser) {
      console.log(`Deleting user: ${nachUser.name} (ID: ${nachUser._id})`);

      // Delete all routines owned by this user
      const deleteRoutinesResult = await Routine.deleteMany({ userId: nachUser._id });
      console.log(`✅ Deleted ${deleteRoutinesResult.deletedCount} routines`);

      // Delete the user
      await User.findByIdAndDelete(nachUser._id);
      console.log('✅ User deleted successfully');
    } else {
      console.log('ℹ️  User "nacho" not found (may have been already deleted)');
    }

    console.log('\n✅ Script completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserIssues();
