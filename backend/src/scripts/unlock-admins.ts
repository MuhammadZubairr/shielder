import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log(`✅ Unlocked ${result.count} admin/super-admin account(s).`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
