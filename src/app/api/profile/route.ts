import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUserAuth } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive user data
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ref_id: true,
        ref_by: true,
        status: true,
        balance: true,
        deposit_balance: true,
        payment_method: true,
        method_number: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            deposits: true,
            withdrawals: true,
            purchases: true,
            tasks: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get additional statistics
    const [
      totalDeposits,
      totalWithdrawals,
      totalPurchases,
      completedTasks,
      referralCount,
      totalEarnings
    ] = await Promise.all([
      db.deposit.aggregate({
        where: { userId: user.id, status: 'approved' },
        _sum: { final_amount: true },
      }),
      db.withdraw.aggregate({
        where: { userId: user.id, status: 'approved' },
        _sum: { final_amount: true },
      }),
      db.purchase.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
        _count: true,
      }),
      db.task.count({
        where: { userId: user.id, status: 'completed' },
      }),
      db.user.count({
        where: { refBy: userData.ref_id },
      }),
      db.ledgerHistory.aggregate({
        where: { 
          userId: user.id, 
          type: 'earning',
          amount: { gt: 0 }
        },
        _sum: { amount: true },
      }),
    ]);

    // Get recent activities
    const recentActivities = await db.ledgerHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        balance: true,
        createdAt: true,
      },
    });

    const profileData = {
      user: userData,
      stats: {
        totalDeposits: totalDeposits._sum.final_amount || 0,
        totalWithdrawals: totalWithdrawals._sum.final_amount || 0,
        totalPurchases: totalPurchases._sum.amount || 0,
        activePurchases: totalPurchases._count,
        completedTasks,
        referralCount,
        totalEarnings: totalEarnings._sum.amount || 0,
      },
      recentActivities,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, payment_method, method_number, currentPassword, newPassword } = await request.json();

    // Get current user data
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};

    // Update basic information
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (payment_method) updateData.payment_method = payment_method;
    if (method_number) updateData.method_number = method_number;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ref_id: true,
        status: true,
        balance: true,
        deposit_balance: true,
        payment_method: true,
        method_number: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}