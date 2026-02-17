import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking SystemSettings model...');
    let settings = await (prisma as any).systemSettings.findUnique({
      where: { id: 'CURRENT' }
    });
    
    if (!settings) {
      console.log('Initializing settings...');
      settings = await (prisma as any).systemSettings.create({
        data: { id: 'CURRENT' }
      });
    }
    
    console.log('Settings:', settings);
  } catch (error: any) {
    console.error('Error accessing SystemSettings:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
