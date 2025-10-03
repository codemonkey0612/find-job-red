import fetch from 'node-fetch';

const createAdminUser = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'System Administrator'
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
      console.log('Token:', result.data.token);
    } else {
      console.log('❌ Failed to create admin user:', result.message);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.log('Make sure the server is running on port 3001');
  }
};

createAdminUser();

