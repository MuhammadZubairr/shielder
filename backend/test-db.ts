
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Connected successfully!');

    console.log('\n--- Testing Monthly Analytics ---');
    try {
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          startDate: new Date(date.getFullYear(), date.getMonth(), 1),
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        };
      }).reverse();

      const stats = await Promise.all(
        lastSixMonths.map(async (m) => {
          const orders = await (prisma as any).order.aggregate({
            where: {
              createdAt: {
                gte: m.startDate,
                lte: m.endDate,
              },
            },
            _count: {
              id: true,
            },
            _sum: {
              total: true,
            },
          });

          return {
            month: m.month,
            orders: Number(orders._count.id || 0),
            revenue: Number(orders._sum.total || 0),
          };
        })
      );
      console.log('Monthly Analytics result:', JSON.stringify(stats, null, 2));
    } catch (e: any) {
      console.error('Monthly Analytics failed:', e.message);
    }

    console.log('\n--- Testing Products Query ---');
    try {
      const productsCount = await prisma.product.count();
      console.log('Products count:', productsCount);
      const firstProduct = await prisma.product.findFirst();
      console.log('First product:', firstProduct ? 'Found' : 'None');
    } catch (e: any) {
      console.error('Products query failed:', e.message);
    }

    console.log('\n--- Testing Users Query ---');
    try {
      const usersCount = await prisma.user.count();
      console.log('Users count:', usersCount);
    } catch (e: any) {
      console.error('Users count failed:', e.message);
    }

    console.log('\n--- Testing Low Stock Raw Query ---');
    try {
      const lowStockResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM products
        WHERE is_active = true AND stock <= minimum_stock_threshold
      `);
      console.log('Low Stock result:', JSON.stringify(lowStockResult, null, 2));
    } catch (e: any) {
      console.error('Low Stock raw query failed:', e.message);
    }

  } catch (error) {
    console.error('Database test setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
