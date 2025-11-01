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
    const status = searchParams.get('status'); // pending, completed, expired
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Get task details
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (task.status !== 'pending') {
      return NextResponse.json({ error: 'Task is not available for claiming' }, { status: 400 });
    }

    if (task.dueDate && new Date(task.dueDate) < new Date()) {
      return NextResponse.json({ error: 'Task has expired' }, { status: 400 });
    }

    // Mark task as completed
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
      },
    });

    // Add reward to user balance
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + task.reward,
      },
    });

    // Create ledger entry
    await db.ledgerHistory.create({
      data: {
        userId: user.id,
        type: 'task',
        amount: task.reward,
        description: `Task reward: ${task.title}`,
        balance: user.balance + task.reward,
      },
    });

    return NextResponse.json({
      task: updatedTask,
      message: 'Task completed successfully! Reward added to your balance.',
    });
  } catch (error) {
    console.error('Claim task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}