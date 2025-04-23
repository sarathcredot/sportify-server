const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function runMigration() {
  try {
    // Get all migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js')
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(__dirname, file));
      await migration.up();
    }

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 