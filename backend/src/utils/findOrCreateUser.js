import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const findOrCreateUser = async (username) => {
  try {
    await connectDB();

    console.log('\n=== BUSCANDO O CREANDO USUARIO ===\n');

    // Try to find user by username or name
    let user = await User.findOne({
      $or: [
        { username: { $regex: username, $options: 'i' } },
        { name: { $regex: username, $options: 'i' } }
      ]
    });

    if (user) {
      console.log(`✓ Usuario encontrado:`);
      console.log(`  - Nombre: ${user.name}`);
      console.log(`  - Username: ${user.username}`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - Rutina activa: ${user.activeRoutineId || 'ninguna'}`);
    } else {
      console.log(`Usuario "${username}" no encontrado.`);
      console.log(`\nCreando nuevo usuario...`);

      // Create new user
      const password = 'password123'; // Default password

      user = await User.create({
        name: username,
        username: username.toLowerCase(),
        password: password, // Will be hashed by the model pre-save hook
        preferences: {
          darkMode: true,
          units: 'metric',
          restTimerEnabled: true,
          defaultRestTime: 90
        }
      });

      console.log(`✓ Usuario creado:`);
      console.log(`  - Nombre: ${user.name}`);
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Contraseña: ${password}`);
      console.log(`  - ID: ${user._id}`);
    }

    console.log('\n=== COMPLETADO ===\n');
    console.log(`Usar este username para importar la rutina: ${user.username}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

const username = process.argv[2];

if (!username) {
  console.error('Error: Debes proporcionar un nombre de usuario');
  console.log('\nUso: node src/utils/findOrCreateUser.js <username>');
  process.exit(1);
}

findOrCreateUser(username);
