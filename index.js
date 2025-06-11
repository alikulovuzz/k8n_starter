const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// File path for users data
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper functions for user management
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

function validateUser(userData) {
  const { name, email, phone } = userData;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email must be a valid email address');
    }
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    errors.push('Phone number is required and must be a non-empty string');
  }

  return errors;
}

// Routes
app.get('/', (req, res) => {
  res.send('✅ Hello from Node.js HPA test! yangilanish 11.06.2025 15:08 test');
});

app.get('/load', (req, res) => {
  // Simulate CPU intensive task with non-blocking approach
  const startTime = Date.now();
  
  function cpuIntensiveTask() {
    const chunkStart = Date.now();
    // Process in small chunks to avoid blocking the event loop completely
    while (Date.now() - chunkStart < 50) {
      Math.random();
    }
    
    if (Date.now() - startTime < 5000) {
      // Continue processing in next tick
      setImmediate(cpuIntensiveTask);
    } else {
      res.send('🌀 CPU load finished (5s)');
    }
  }
  
  cpuIntensiveTask();
});

// User Management Endpoints

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// POST - Create new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate input
    const validationErrors = validateUser(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Read existing users
    const users = await readUsers();
    
    // Check for email duplicates
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create new user with auto-generated ID
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      createdAt: new Date().toISOString()
    };

    // Add user and save
    users.push(newUser);
    await writeUsers(users);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT - Edit user
app.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, phone } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate input
    const validationErrors = validateUser(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Read existing users
    const users = await readUsers();
    
    // Find user to update
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email duplicates (excluding current user)
    const existingUser = users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.id !== userId
    );
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    await writeUsers(users);

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE - Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Read existing users
    const users = await readUsers();
    
    // Find user to delete
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove user
    const deletedUser = users.splice(userIndex, 1)[0];
    await writeUsers(users);

    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export the app for testing
module.exports = app;

// Export helper functions for testing
module.exports.readUsers = readUsers;
module.exports.writeUsers = writeUsers;
module.exports.USERS_FILE = USERS_FILE;