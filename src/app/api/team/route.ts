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
    const level = parseInt(searchParams.get('level') || '1');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Get direct referrals (level 1)
    const directReferrals = await db.user.findMany({
      where: { refBy: user.ref_id },
      select: {
        id: true,
        name: true,
        email: true,
        ref_id: true,
        status: true,
        balance: true,
        deposit_balance: true,
        createdAt: true,
        _count: {
          select: {
            deposits: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalDirectReferrals = await db.user.count({
      where: { refBy: user.ref_id },
    });

    // Calculate team statistics
    const teamStats = await db.user.groupBy({
      by: ['status'],
      where: { refBy: user.ref_id },
      _count: {
        id: true,
      },
      _sum: {
        balance: true,
        deposit_balance: true,
      },
    });

    // Get total team members at all levels
    const getAllLevelMembers = async (refId: string, currentLevel: number, maxLevel: number): Promise<any[]> => {
      if (currentLevel > maxLevel) return [];

      const members = await db.user.findMany({
        where: { refBy: refId },
        select: {
          id: true,
          name: true,
          email: true,
          ref_id: true,
          status: true,
          balance: true,
          deposit_balance: true,
          createdAt: true,
          level: currentLevel,
        },
      });

      let allMembers = [...members];
      
      for (const member of members) {
        const subMembers = await getAllLevelMembers(member.ref_id, currentLevel + 1, maxLevel);
        allMembers = [...allMembers, ...subMembers];
      }

      return allMembers;
    };

    const allTeamMembers = await getAllLevelMembers(user.ref_id, 1, 5);
    const totalTeamMembers = allTeamMembers.length;
    const activeTeamMembers = allTeamMembers.filter(m => m.status === 'active').length;

    // Calculate total earnings from referrals
    const referralCommissions = await db.referralCommission.findMany({
      where: { referrerId: user.id },
      _sum: {
        amount: true,
      },
    });

    const totalReferralEarnings = referralCommissions.reduce((sum, commission) => sum + (commission.amount || 0), 0);

    return NextResponse.json({
      directReferrals,
      pagination: {
        total: totalDirectReferrals,
        page,
        limit,
        pages: Math.ceil(totalDirectReferrals / limit),
      },
      stats: {
        totalDirectReferrals,
        totalTeamMembers,
        activeTeamMembers,
        totalReferralEarnings,
        activeMembers: teamStats.find(s => s.status === 'active')?._count.id || 0,
        totalBalance: teamStats.reduce((sum, stat) => sum + (stat._sum.balance || 0), 0),
        totalDepositBalance: teamStats.reduce((sum, stat) => sum + (stat._sum.deposit_balance || 0), 0),
      },
      allTeamMembers: allTeamMembers.slice(0, 50), // Limit to prevent too much data
    });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}