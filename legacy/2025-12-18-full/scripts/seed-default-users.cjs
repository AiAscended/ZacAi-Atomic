/**
 * Seed Default Users Script
 * Creates default users: AiAscended (admin) and Zac (system)
 * Run: node scripts/seed-default-users.cjs
 * Storage: src/ai/data/settings/users.json
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_DIR = path.join(process.cwd(), 'src', 'ai', 'data', 'settings');
const USERS_FILE = path.join(SETTINGS_DIR, 'users.json');

// Ensure directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  console.log('✅ Created src/ai/data/settings directory');
}

// Default users
const defaultUsers = [
  {
    id: 'user-aiascended-001',
    name: 'AiAscended',
    email: 'admin@aiascended.com',
    role: 'admin',
    preferences: {
      theme: 'dark',
      showThinking: true,
      codeHighlighting: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-zac-system-001',
    name: 'Zac',
    email: 'zac@system.ai',
    role: 'system',
    preferences: {
      theme: 'dark',
      showThinking: true,
      codeHighlighting: true,
      autonomousActions: true,
      selfAwareness: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load existing users or create new
let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    users = JSON.parse(data);
    console.log(`📂 Loaded ${users.length} existing users`);
  } catch (error) {
    console.error('⚠️  Error reading existing users:', error.message);
  }
}

// Add default users if they don't exist
let added = 0;
defaultUsers.forEach((defaultUser) => {
  const exists = users.some(u => u.email === defaultUser.email);
  if (!exists) {
    users.push(defaultUser);
    added++;
    console.log(`✅ Added user: ${defaultUser.name} (${defaultUser.role})`);
  } else {
    console.log(`⏭️  User already exists: ${defaultUser.name}`);
  }
});

// Write users file
try {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  console.log(`\n💾 Saved ${users.length} users to ${USERS_FILE}`);
  
  if (added > 0) {
    console.log(`\n🎉 Successfully seeded ${added} default user(s)!`);
  } else {
    console.log('\n✨ All default users already exist.');
  }
} catch (error) {
  console.error('\n❌ Error writing users file:', error.message);
  process.exit(1);
}

// Display user summary
console.log('\n👥 User Summary:');
console.log('═'.repeat(60));
users.forEach((user) => {
  const icon = user.role === 'admin' ? '👤' : user.role === 'system' ? '🤖' : '👥';
  console.log(`${icon} ${user.name.padEnd(20)} ${user.role.padEnd(10)} ${user.email}`);
});
console.log('═'.repeat(60));
