import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: {
      id: true, email: true, role: true, isActive: true,
      failedLoginAttempts: true, lockedUntil: true, passwordHash: true,
    },
  });

  for (const u of users) {
    console.log('---');
    console.log('Email          :', u.email);
    console.log('Role           :', u.role);
    console.log('Active         :', u.isActive);
    console.log('Failed attempts:', u.failedLoginAttempts);
    console.log('Locked until   :', u.lockedUntil);
    console.log('Has hash       :', !!u.passwordHash, '| prefix:', u.passwordHash?.substring(0, 7));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
