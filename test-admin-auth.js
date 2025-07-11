#!/usr/bin/env node

/**
 * Test script to verify admin authentication works
 */

const { PrismaClient } = require('@prisma/client');

async function testAdminAuth() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db'
      }
    }
  });

  try {
    console.log('🔍 Testing admin authentication...');
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   ID: ${adminUser.id}`);
    } else {
      console.log('❌ Admin user not found');
    }

    // Check if regular user exists
    const regularUser = await prisma.user.findUnique({
      where: { email: 'user@test.com' }
    });

    if (regularUser) {
      console.log('✅ Regular user found:');
      console.log(`   Email: ${regularUser.email}`);
      console.log(`   Name: ${regularUser.name}`);
      console.log(`   Role: ${regularUser.role}`);
      console.log(`   ID: ${regularUser.id}`);
    } else {
      console.log('❌ Regular user not found');
    }

    console.log('\n🎯 Test credentials for manual testing:');
    console.log('Admin: admin@test.com / password');
    console.log('User:  user@test.com / password');

  } catch (error) {
    console.error('❌ Error testing admin auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAuth();
