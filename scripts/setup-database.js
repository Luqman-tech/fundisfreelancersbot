const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up database...');

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory');
}

// Create migrations directory
const migrationsDir = path.join(__dirname, '../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log('✅ Created migrations directory');
}

// Create seeders directory
const seedersDir = path.join(__dirname, '../seeders');
if (!fs.existsSync(seedersDir)) {
  fs.mkdirSync(seedersDir, { recursive: true });
  console.log('✅ Created seeders directory');
}

// Initialize Sequelize if not already done
const sequelizeRcPath = path.join(__dirname, '../.sequelizerc');
if (!fs.existsSync(sequelizeRcPath)) {
  const sequelizeRcContent = `
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};
`;
  fs.writeFileSync(sequelizeRcPath, sequelizeRcContent);
  console.log('✅ Created .sequelizerc file');
}

console.log('✅ Database setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Update your .env file with database credentials');
console.log('2. Run: npm run db:migrate');
console.log('3. Run: npm run db:seed');