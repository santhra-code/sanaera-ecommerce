const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database connected successfully!');
    console.log('Version:', result[0].version);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Full error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
