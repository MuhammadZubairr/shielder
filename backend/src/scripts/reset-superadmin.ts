
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@shielder.com';
  const password = 'SuperAdmin@2026';
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log(`Checking for user: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });

  if (!user) {
    console.log('User not found. Creating...');
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
        emailVerified: true,
        profile: {
          create: {
            fullName: 'Super Admin',
            preferredLanguage: 'en',
          }
        }
      }
    });
    console.log('User created successfully.');
  } else {
    console.log('User found. Updating password and status...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        status: UserStatus.ACTIVE,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    console.log('User updated successfully.');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
