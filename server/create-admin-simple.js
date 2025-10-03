import bcrypt from 'bcryptjs';

// Simple script to create admin user credentials
const createAdminCredentials = () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const adminName = 'System Administrator';

  // Hash the password (same as in the backend)
  const saltRounds = 10;
  bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }

    console.log('🔑 Admin User Credentials:');
    console.log('========================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('========================');
    console.log('');
    console.log('📝 To create this admin user:');
    console.log('1. Go to the registration page');
    console.log('2. Register with the above credentials');
    console.log('3. Then manually update the role in database:');
    console.log(`   UPDATE users SET role = 'admin' WHERE email = '${adminEmail}';`);
    console.log('');
    console.log('🔐 Hashed Password (for reference):');
    console.log(hash);
  });
};

createAdminCredentials();

