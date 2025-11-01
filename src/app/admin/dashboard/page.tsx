'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Gift
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalPackages: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activePurchases: number;
  totalBalance: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPackages: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activePurchases: 0,
    totalBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your investment platform</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          {/* Total Packages Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">
                Available packages
              </p>
            </CardContent>
          </Card>

          {/* Total Deposits Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loading ? '...' : stats.totalDeposits.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total deposit amount
              </p>
            </CardContent>
          </Card>

          {/* Total Withdrawals Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loading ? '...' : stats.totalWithdrawals.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total withdrawal amount
              </p>
            </CardContent>
          </Card>

          {/* Active Purchases Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Purchases</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activePurchases}</div>
              <p className="text-xs text-muted-foreground">
                Active package purchases
              </p>
            </CardContent>
          </Card>

          {/* Total Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total User Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loading ? '...' : stats.totalBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Combined user balances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button onClick={() => window.location.href = '/admin/users'} className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button onClick={() => window.location.href = '/admin/packages'} variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Manage Packages
            </Button>
            <Button onClick={() => window.location.href = '/admin/deposits'} variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Manage Deposits
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}