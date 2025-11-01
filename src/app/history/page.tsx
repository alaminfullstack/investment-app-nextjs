'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Download, 
  Filter, 
  Calendar,
  DollarSign, 
  TrendingUp, 
  Package,
  Gift,
  CreditCard,
  Search,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  balance: number;
  status?: string;
  createdAt: string;
}

interface Deposit {
  id: string;
  amount: number;
  final_amount: number;
  method: string;
  transactionHash?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  final_amount: number;
  method: string;
  address: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Purchase {
  id: string;
  amount: number;
  status: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  package: {
    id: string;
    title: string;
    price: number;
    dailyIncome: number;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  reward: number;
  type: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface HistoryResponse {
  ledger?: LedgerEntry[];
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
  purchases?: Purchase[];
  tasks?: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchHistory();
  }, [activeTab, currentPage, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab === 'all' ? 'all' : activeTab,
        page: currentPage.toString(),
        limit: '20',
      });

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data: HistoryResponse = await response.json();
      setHistoryData(data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load history');
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'deposit' || type === 'withdrawal') {
      switch (status) {
        case 'approved':
          return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
        case 'rejected':
          return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
        default:
          return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      }
    } else if (type === 'purchase') {
      switch (status) {
        case 'active':
          return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        case 'completed':
          return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
        case 'cancelled':
          return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
        default:
          return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      }
    } else if (type === 'task') {
      switch (status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
        case 'expired':
          return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
        default:
          return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      }
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'purchase':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'earning':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'task':
        return <Gift className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportHistory = () => {
    if (!historyData) return;

    let csvContent = '';
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance', 'Status'];
    csvContent += headers.join(',') + '\n';

    if (historyData.ledger) {
      historyData.ledger.forEach((entry) => {
        const row = [
          new Date(entry.createdAt).toLocaleString(),
          entry.type,
          `"${entry.description}"`,
          entry.amount.toString(),
          entry.balance.toString(),
          entry.status || '',
        ];
        csvContent += row.join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('History exported successfully!');
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600 mt-2">View your complete transaction history and account activity</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={exportHistory}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button onClick={fetchHistory} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="deposit">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
            <TabsTrigger value="purchase">Purchases</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Your complete transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.ledger?.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(entry.type)}
                            <span className="capitalize">{entry.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell className={entry.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {entry.amount > 0 ? '+' : ''}${entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>${entry.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          {entry.status && getStatusBadge(entry.status, entry.type)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!historyData?.ledger?.length && (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-600">Your transaction history will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit History</CardTitle>
                <CardDescription>Your deposit transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.deposits?.map((deposit) => (
                      <TableRow key={deposit.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          +${deposit.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{deposit.method}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {deposit.transactionHash ? (
                            <span title={deposit.transactionHash}>
                              {deposit.transactionHash.slice(0, 8)}...{deposit.transactionHash.slice(-8)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(deposit.status, 'deposit')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!historyData?.deposits?.length && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No deposits found</h3>
                    <p className="text-gray-600">Your deposit history will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawal">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your withdrawal transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.withdrawals?.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          -${withdrawal.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span title={withdrawal.address}>
                            {withdrawal.address.slice(0, 10)}...{withdrawal.address.slice(-10)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status, 'withdrawal')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!historyData?.withdrawals?.length && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawals found</h3>
                    <p className="text-gray-600">Your withdrawal history will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Your investment package purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Daily Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.purchases?.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.package.title}</div>
                            <div className="text-xs text-gray-500">${purchase.package.price}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${purchase.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-green-600">
                          ${purchase.package.dailyIncome.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(purchase.status, 'purchase')}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(purchase.startDate).toLocaleDateString()}
                            {purchase.endDate && (
                              <div className="text-xs text-gray-500">
                                to {new Date(purchase.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!historyData?.purchases?.length && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases found</h3>
                    <p className="text-gray-600">Your purchase history will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="task">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>Your completed and pending tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData?.tasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {task.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${task.reward.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status, 'task')}</TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div className="text-sm">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-500">No due date</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!historyData?.tasks?.length && (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600">Your task history will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}