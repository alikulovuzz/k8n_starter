const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

class UserService {
  constructor() {
    // a promise chain used to serialize *all* file-mutating operations
    this._queue = Promise.resolve();
  }

  // ensure data file exists (called inside reads/writes)
  async ensureDataFileExists() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]');
    }
  }

  // read the current user array
  async readUsers() {
    await this.ensureDataFileExists();
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  }

  // helper to enqueue a function so that no two run concurrently
  _enqueue(fn) {
    this._queue = this._queue.then(fn, fn);
    return this._queue;
  }

  validateUser(user) {
    const errors = [];

    if (!user.name || user.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (!user.email || !user.email.includes('@')) {
      errors.push('Valid email is required');
    }
    if (!user.phone || !/^\+?\d{10,}$/.test(user.phone.replace(/\s/g, ''))) {
      errors.push('Valid phone number is required (min 10 digits)');
    }

    return errors;
  }

  async getAllUsers() {
    return await this.readUsers();
  }

  async createUser(userData) {
    // run the entire read-modify-write under the lock
    return this._enqueue(async () => {
      const users = await this.readUsers();

      // duplicate-email check
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('Email already exists');
      }

      const newId = users.length > 0
        ? Math.max(...users.map(u => u.id)) + 1
        : 1;

      const newUser = {
        id: newId,
        name: userData.name.trim(),
        email: userData.email.toLowerCase(),
        phone: userData.phone.trim(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
      return newUser;
    });
  }

  async updateUser(id, userData) {
    return this._enqueue(async () => {
      const users = await this.readUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('User not found');

      // ensure email uniqueness
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase() && u.id !== id)) {
        throw new Error('Email already exists');
      }

      const updatedUser = {
        ...users[idx],
        name: userData.name.trim(),
        email: userData.email.toLowerCase(),
        phone: userData.phone.trim(),
        updatedAt: new Date().toISOString()
      };

      users[idx] = updatedUser;
      await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
      return updatedUser;
    });
  }

  async deleteUser(id) {
    return this._enqueue(async () => {
      const users = await this.readUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('User not found');

      const [deleted] = users.splice(idx, 1);
      await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
      return deleted;
    });
  }
}

module.exports = new UserService();
