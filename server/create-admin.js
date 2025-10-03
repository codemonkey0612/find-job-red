import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'job_search_db'
    });

    console.log('Connected to database');

    // Admin user details
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminName = 'System Administrator';

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Check if admin already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Role: admin');
      await connection.end();
      return;
    }

    // Insert admin user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, name, role, email_verified) VALUES (?, ?, ?, ?, ?)',
      [adminEmail, passwordHash, adminName, 'admin', true]
    );

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('User ID:', result.insertId);

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

createAdminUser();

