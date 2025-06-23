#!/usr/bin/env node

console.log('🧪 Testing Authentication System...');

// Test environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

let allGood = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
  } else {
    console.log(`❌ ${envVar} is missing`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 All required environment variables are set!');
  console.log('\n🚀 You can now start the development server with: npm run dev');
} else {
  console.log('\n⚠️  Please set the missing environment variables in .env.local');
}
