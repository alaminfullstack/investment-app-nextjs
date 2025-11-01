'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  History, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Wallet,
  Calculator,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  deposit_balance: number;
  payment_method?: string;
  method_number?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  final_amount: number;
  method: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function WithdrawPage() {
  const [user, setUser] = useState<User | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    address: '',
    notes: '',
  });

  // Available withdrawal methods
  const withdrawalMethods = [
    { name: 'Bank Transfer', minAmount: 10, maxAmount: 10000, fee: 0 },
    { name: 'USDT (TRC20)', minAmount: 5, maxAmount: 50000, fee: 2 },
    { name: 'Bitcoin', minAmount: 10, maxAmount: 25000, fee: 0.0005 },
    { name: 'Ethereum', minAmount: 15, maxAmount: 20000, fee: 0.01 },
    { name: 'Litecoin', minAmount: 5, maxAmount: 30000, fee: 0.01 },
  ];

  useEffect(() => {
    fetchUserData();
    fetchWithdrawals();
  }, [currentPage]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Fetch user data error:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/withdrawals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch withdrawals');

      const data: WithdrawalsResponse = await response.json();
      setWithdrawals(data.withdrawals);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load withdrawal history');
      console.error('Fetch withdrawals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create withdrawal request');
      }

      toast.success('Withdrawal request submitted successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchUserData();
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
      console.error('Create withdrawal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      method: '',
      address: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getMethodLimits = (methodName: string) => {
    return withdrawalMethods.find(m => m.name === methodName);
  };

  const calculateFinalAmount = () => {
    if (!formData.amount || !formData.method) return 0;
    
    const method = getMethodLimits(formData.method);
    if (!method) return parseFloat(formData.amount);
    
    const amount = parseFloat(formData.amount);
    return Math.max(0, amount - method.fee);
  };

  const openWithdrawDialog = () => {
    if (!user) {
      toast.error('Please login to make a withdrawal');
      return;
    }
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading withdrawal options...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please login to access withdrawal features.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-gray-600 mt-2">Withdraw your earnings to your preferred payment method</p>
            </div>
            <Button className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Withdrawal History</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Available Balance</span>
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
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Withdrawal Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Requested Amount:</span>
                  <span className="font-medium">${formData.amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processing Fee:</span>
                  <span className="font-medium">
                    ${formData.amount && formData.method ? 
                      getMethodLimits(formData.method)?.fee.toFixed(2) || '0.00' : '0.00'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">Final Amount:</span>
                  <span className="font-bold text-green-600">${calculateFinalAmount().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Important Withdrawal Information</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Withdrawal requests are processed within 24-48 hours</li>
                  <li>• Minimum withdrawal amount varies by payment method</li>
                  <li>• Processing fees may apply depending on the withdrawal method</li>
                  <li>• Make sure to provide correct withdrawal details</li>
                  <li>• Funds will be frozen from your balance until the request is processed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Methods */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Withdrawal Methods</h2>
            <Button onClick={openWithdrawDialog} disabled={user.balance <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Make Withdrawal
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {withdrawalMethods.map((method) => (
              <Card key={method.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>{method.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Min: ${method.minAmount} | Max: ${method.maxAmount}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Processing Fee:</span>
                      <span className="text-sm">
                        {method.fee > 0 ? `$${method.fee}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Processing Time:</span>
                      <span className="text-sm">24-48 hours</span>
                    </div>
                    <Button 
                      onClick={openWithdrawDialog}
                      className="w-full"
                      disabled={user.balance < method.minAmount}
                    >
                      {user.balance < method.minAmount ? 'Insufficient Balance' : 'Withdraw'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
            <CardDescription>Your withdrawal history and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">${withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>{withdrawal.method}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <span title={withdrawal.address}>
                        {withdrawal.address.slice(0, 10)}...{withdrawal.address.slice(-10)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {withdrawals.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawals yet</h3>
                <p className="text-gray-600">Your withdrawal history will appear here.</p>
              </div>
            )}

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
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make a Withdrawal</DialogTitle>
            <DialogDescription>
              Fill in the withdrawal details to request a payout
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Balance:</span>
                  <span className="text-sm font-bold text-green-600">${user.balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="method">Withdrawal Method</Label>
                <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    {withdrawalMethods.map((method) => (
                      <SelectItem 
                        key={method.name} 
                        value={method.name}
                        disabled={user.balance < method.minAmount}
                      >
                        {method.name} (Min: ${method.minAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min={formData.method ? getMethodLimits(formData.method)?.minAmount || 0 : 0}
                  max={formData.method ? getMethodLimits(formData.method)?.maxAmount || user.balance : user.balance}
                  required
                />
                {formData.method && (
                  <p className="text-xs text-gray-500">
                    Min: ${getMethodLimits(formData.method)?.minAmount} | 
                    Max: ${Math.min(getMethodLimits(formData.method)?.maxAmount || Infinity, user.balance).toFixed(2)}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Withdrawal Address/Account</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter wallet address or account number"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions"
                />
              </div>

              {formData.amount && formData.method && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Requested Amount:</span>
                      <span>${formData.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee:</span>
                      <span>${getMethodLimits(formData.method)?.fee || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>You will receive:</span>
                      <span className="text-green-600">${calculateFinalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}