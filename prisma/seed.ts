import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('Created admin user:', admin);

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      app_name: 'Investment App',
      currency: 'USD',
      deposit_bonus: 0,
      allow_deposit_bonus: false,
      withdraw_enabled: true,
    },
  });

  console.log('Created settings:', settings);

  // Create default referral commission
  const existingCommission = await prisma.referralCommission.findFirst({
    where: { level: 1 }
  });

  const referralCommission = existingCommission || await prisma.referralCommission.create({
    data: {
      level: 1,
      name: 'Level 1',
      commission: 10.0,
      status: 'active',
    },
  });

  console.log('Created referral commission:', referralCommission);

  // Create sample payment methods
  const paymentMethods = [
    { name: 'Bank Transfer', address: '1234567890' },
    { name: 'PayPal', address: 'paypal@example.com' },
    { name: 'Crypto Wallet', address: '0x1234567890abcdef' },
  ];

  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: method.name }
    });
    
    if (!existing) {
      await prisma.paymentMethod.create({
        data: method,
      });
    }
  }

  console.log('Created payment methods');

  // Create sample packages
  const packages = [
    {
      title: 'Starter Package',
      description: 'Perfect for beginners',
      price: 50,
      daily_income: 2,
      validity: 30,
      total_income: 60,
    },
    {
      title: 'Professional Package',
      description: 'Great for serious investors',
      price: 200,
      daily_income: 10,
      validity: 30,
      total_income: 300,
    },
    {
      title: 'Premium Package',
      description: 'Maximum returns',
      price: 500,
      daily_income: 30,
      validity: 30,
      total_income: 900,
    },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({
      where: { title: pkg.title }
    });
    
    if (!existing) {
      await prisma.package.create({
        data: pkg,
      });
    }
  }

  console.log('Created sample packages');

  // Create sample tasks
  const tasks = [
    {
      name: 'Daily Login',
      task_income: 1,
      duration: 5,
    },
    {
      name: 'Watch Video',
      task_income: 2,
      duration: 10,
    },
    {
      name: 'Complete Survey',
      task_income: 5,
      duration: 15,
    },
  ];

  for (const task of tasks) {
    const existing = await prisma.task.findFirst({
      where: { name: task.name }
    });
    
    if (!existing) {
      await prisma.task.create({
        data: task,
      });
    }
  }

  console.log('Created sample tasks');

  // Create sample bonus codes
  const bonusCodes = [
    { code: 'WELCOME10', income_amount: 10 },
    { code: 'STARTER20', income_amount: 20 },
    { code: 'BONUS50', income_amount: 50 },
  ];

  for (const code of bonusCodes) {
    const existing = await prisma.bonusCode.findFirst({
      where: { code: code.code }
    });
    
    if (!existing) {
      await prisma.bonusCode.create({
        data: code,
      });
    }
  }

  console.log('Created sample bonus codes');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });