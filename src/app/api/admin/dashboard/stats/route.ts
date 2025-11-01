import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total users
    const totalUsers = await db.user.count();

    // Get total packages
    const totalPackages = await db.package.count();

    // Get total deposits amount
    const deposits = await db.deposit.aggregate({
      _sum: {
        final_amount: true
      },
      where: {
        status: 'approved'
      }
    });

    // Get total withdrawals amount
    const withdrawals = await db.withdraw.aggregate({
      _sum: {
        final_amount: true
      },
      where: {
        status: 'approved'
      }
    });

    // Get active purchases
    const activePurchases = await db.purchase.count({
      where: {
        status: 'active'
      }
    });

    // Get total user balance
    const userBalances = await db.user.aggregate({
      _sum: {
        balance: true,
        deposit_balance: true
      }
    });

    const totalBalance = (userBalances._sum.balance || 0) + (userBalances._sum.deposit_balance || 0);

    const stats = {
      totalUsers,
      totalPackages,
      totalDeposits: deposits._sum.final_amount || 0,
      totalWithdrawals: withdrawals._sum.final_amount || 0,
      activePurchases,
      totalBalance
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}