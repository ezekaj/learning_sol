#!/usr/bin/env node

/**
 * Database Connectivity Testing Script
 * Tests database connection and API routes functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testDatabaseConnection() {
  console.log('🔌 Testing Database Connection...');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    console.log('📊 Testing database operations...');
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`   Users in database: ${userCount}`);
    
    // Test course count
    const courseCount = await prisma.course.count();
    console.log(`   Courses in database: ${courseCount}`);
    
    // Test achievement count
    const achievementCount = await prisma.achievement.count();
    console.log(`   Achievements in database: ${achievementCount}`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 Connection timeout - check your DATABASE_URL');
    } else if (error.message.includes('P1003')) {
      console.log('\n💡 Database does not exist - check your connection string');
    } else if (error.message.includes('P1008')) {
      console.log('\n💡 Connection timeout - database may be unreachable');
    }
    
    return false;
  }
}

async function testAPIRoutes() {
  console.log('\n🌐 Testing API Routes...');
  
  // Start development server in background
  console.log('🚀 Starting development server...');
  
  try {
    // Test if server is already running
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('✅ Development server is already running');
      return await runAPITests();
    }
  } catch (error) {
    // Server not running, need to start it
  }
  
  console.log('⚠️  Development server not running');
  console.log('💡 To test API routes, run: npm run dev');
  console.log('   Then run this script again');
  
  return false;
}

async function runAPITests() {
  console.log('🧪 Running API endpoint tests...');
  
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:3000/api/health',
      method: 'GET'
    },
    {
      name: 'Learning Paths',
      url: 'http://localhost:3000/api/learning-paths',
      method: 'GET'
    },
    {
      name: 'Achievements',
      url: 'http://localhost:3000/api/achievements',
      method: 'GET'
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { method: test.method });
      
      if (response.ok) {
        console.log(`✅ ${test.name}: ${response.status}`);
        passedTests++;
      } else {
        console.log(`⚠️  ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 API Tests: ${passedTests}/${tests.length} passed`);
  return passedTests === tests.length;
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Testing Environment Variables...');
  
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const optional = [
    'GEMINI_API_KEY',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  let allRequired = true;
  
  console.log('📋 Required variables:');
  for (const varName of required) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allRequired = false;
    }
  }
  
  console.log('\n🔧 Optional variables:');
  for (const varName of optional) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`⚪ ${varName}: Not set`);
    }
  }
  
  return allRequired;
}

async function testBuild() {
  console.log('\n🏗️  Testing Build Process...');
  
  try {
    console.log('🔄 Running build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful');
    return true;
  } catch (error) {
    console.log('❌ Build failed:');
    const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
    console.log(output.split('\n').slice(-10).join('\n')); // Show last 10 lines
    return false;
  }
}

async function main() {
  console.log('🚀 Database and API Testing Suite');
  console.log('==================================\n');

  const results = {
    environment: false,
    database: false,
    build: false,
    api: false
  };

  // Test environment variables
  results.environment = await testEnvironmentVariables();
  
  // Test database connection
  if (results.environment) {
    results.database = await testDatabaseConnection();
  } else {
    console.log('\n⚠️  Skipping database test due to missing environment variables');
  }
  
  // Test build process
  results.build = await testBuild();
  
  // Test API routes (optional)
  results.api = await testAPIRoutes();

  // Summary
  console.log('\n🎯 FINAL RESULTS:');
  console.log('================');
  console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`Database Connection: ${results.database ? '✅' : '❌'}`);
  console.log(`Build Process: ${results.build ? '✅' : '❌'}`);
  console.log(`API Routes: ${results.api ? '✅' : '⚠️  (requires dev server)'}`);

  const readyForProduction = results.environment && results.database && results.build;
  
  if (readyForProduction) {
    console.log('\n🎉 System is ready for production deployment!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy to your chosen platform (Vercel, Railway, etc.)');
    console.log('2. Set environment variables in deployment platform');
    console.log('3. Update OAuth callback URLs to production domain');
    console.log('4. Test production deployment');
  } else {
    console.log('\n⚠️  System needs attention before production deployment');
    console.log('\n🔧 Required fixes:');
    if (!results.environment) console.log('- Configure missing environment variables');
    if (!results.database) console.log('- Fix database connection issues');
    if (!results.build) console.log('- Resolve build errors');
  }
}

main().catch(console.error);
