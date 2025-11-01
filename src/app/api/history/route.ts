import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUserAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // deposit, withdrawal, purchase, earning, task, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build where clause for date filtering
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    let data: any = {};

    if (type === 'all' || !type) {
      // Get all ledger history
      const whereClause: any = { userId: user.id, ...dateFilter };
      
      const [ledger, total] = await Promise.all([
        db.ledgerHistory.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.ledgerHistory.count({ where: whereClause }),
      ]);

      data = {
        ledger,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } else {
      // Get specific type of history
      switch (type) {
        case 'deposit':
          const whereDeposit: any = { userId: user.id, ...dateFilter };
          const [deposits, depositTotal] = await Promise.all([
            db.deposit.findMany({
              where: whereDeposit,
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            db.deposit.count({ where: whereDeposit }),
          ]);
          data = {
            deposits,
            pagination: {
              total: depositTotal,
              page,
              limit,
              pages: Math.ceil(depositTotal / limit),
            },
          };
          break;

        case 'withdrawal':
          const whereWithdrawal: any = { userId: user.id, ...dateFilter };
          const [withdrawals, withdrawalTotal] = await Promise.all([
            db.withdrawal.findMany({
              where: whereWithdrawal,
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            db.withdrawal.count({ where: whereWithdrawal }),
          ]);
          data = {
            withdrawals,
            pagination: {
              total: withdrawalTotal,
              page,
              limit,
              pages: Math.ceil(withdrawalTotal / limit),
            },
          };
          break;

        case 'purchase':
          const wherePurchase: any = { userId: user.id, ...dateFilter };
          const [purchases, purchaseTotal] = await Promise.all([
            db.purchase.findMany({
              where: wherePurchase,
              include: {
                package: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    dailyIncome: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            db.purchase.count({ where: wherePurchase }),
          ]);
          data = {
            purchases,
            pagination: {
              total: purchaseTotal,
              page,
              limit,
              pages: Math.ceil(purchaseTotal / limit),
            },
          };
          break;

        case 'task':
          const whereTask: any = { userId: user.id, ...dateFilter };
          const [tasks, taskTotal] = await Promise.all([
            db.task.findMany({
              where: whereTask,
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
            }),
            db.task.count({ where: whereTask }),
          ]);
          data = {
            tasks,
            pagination: {
              total: taskTotal,
              page,
              limit,
              pages: Math.ceil(taskTotal / limit),
            },
          };
          break;

        default:
          return NextResponse.json({ error: 'Invalid history type' }, { status: 400 });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}