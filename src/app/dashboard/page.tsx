'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  CreditCard,
  Gift,
  LogOut,
  Menu,
  X,
  User,
  History,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  ref_id: string;
  balance: number;
  deposit_balance: number;
}

interface DashboardStats {
  totalIncome: number;
  todayIncome: number;
  yesterdayIncome: number;
  weeklyIncome: number;
  monthlyIncome: number;
  totalPurchases: number;
  activeTasks: number;
  teamMembers: number;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    todayIncome: 0,
    yesterdayIncome: 0,
    weeklyIncome: 0,
    monthlyIncome: 0,
    totalPurchases: 0,
    activeTasks: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchDashboardStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { icon: Package, label: 'Packages', href: '/packages' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: CreditCard, label: 'Deposit', href: '/deposit' },
    { icon: TrendingUp, label: 'Withdraw', href: '/withdraw' },
    { icon: Package, label: 'My Packages', href: '/my-packages' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Gift, label: 'Bonus Codes', href: '/bonus-codes' },
    { icon: Gift, label: 'Tasks', href: '/tasks' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">User Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
          
          <div className="px-4 mt-8">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {user.ref_id}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${user.balance.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Available for withdrawal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Deposit Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${user.deposit_balance.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Available for investments</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  All time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.todayIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Earned today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPurchases}</div>
                <p className="text-xs text-muted-foreground">
                  Active investments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Direct referrals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Income Summary</CardTitle>
              <CardDescription>Your earnings over different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Yesterday</p>
                  <p className="text-xl font-semibold">${stats.yesterdayIncome.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-xl font-semibold">${stats.weeklyIncome.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-semibold">${stats.monthlyIncome.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/packages">
                <Button className="w-full h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Browse Packages
                </Button>
              </Link>
              <Link href="/deposit">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Add Funds
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Gift className="h-6 w-6 mb-2" />
                  Complete Tasks
                </Button>
              </Link>
              <Link href="/team">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  View Team
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}