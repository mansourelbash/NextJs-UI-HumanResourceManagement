#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HRMS Backend Setup Script');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '.env.example');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please update it with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully.\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('⚠️  Make sure your DATABASE_URL is configured in .env file.\n');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads', 'faces');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created.\n');
}

console.log('🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Update your .env file with the correct database configuration');
console.log('2. Run: npm run migrate  (to create database tables)');
console.log('3. Run: npm run seed     (to populate with sample data)');
console.log('4. Run: npm run dev      (to start the development server)');
console.log('\n📚 See README.md for more detailed instructions.');
