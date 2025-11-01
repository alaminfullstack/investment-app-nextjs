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
  CreditCard, 
  Plus, 
  History, 
  Clock, 
  CheckCircle, 
  XCircle,
  Copy,
  Upload,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  address: string;
  instructions: string;
  minAmount: number;
  maxAmount: number;
  status: string;
}

interface Deposit {
  id: string;
  amount: number;
  final_amount: number;
  method: string;
  transactionHash?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DepositsResponse {
  deposits: Deposit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function DepositPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    transactionHash: '',
    notes: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchDeposits();
  }, [currentPage]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      toast.error('Failed to load payment methods');
      console.error('Fetch payment methods error:', error);
    }
  };

  const fetchDeposits = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/deposits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deposits');

      const data: DepositsResponse = await response.json();
      setDeposits(data.deposits);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load deposit history');
      console.error('Fetch deposits error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deposit request');
      }

      toast.success('Deposit request submitted successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchDeposits();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit deposit request');
      console.error('Create deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      method: '',
      transactionHash: '',
      notes: '',
    });
    setSelectedMethod(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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

  const openDepositDialog = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData(prev => ({
      ...prev,
      method: method.name,
    }));
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deposit options...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Deposit Funds</h1>
              <p className="text-gray-600 mt-2">Add funds to your account to start investing</p>
            </div>
            <Button className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Deposit History</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Deposit Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Minimum deposit amount varies by payment method</li>
                  <li>• All deposits are reviewed and processed within 24 hours</li>
                  <li>• Make sure to use the correct payment details</li>
                  <li>• Save your transaction hash for reference</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>{method.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Min: ${method.minAmount} | Max: ${method.maxAmount}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Address/Account</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input 
                          value={method.address} 
                          readOnly 
                          className="font-mono text-xs" 
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(method.address)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {method.instructions && (
                      <div>
                        <Label className="text-sm font-medium">Instructions</Label>
                        <p className="text-xs text-gray-600 mt-1">{method.instructions}</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => openDepositDialog(method)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Deposit Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods Available</h3>
                <p className="text-gray-600">Payment methods are currently being configured. Please check back later.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Deposits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
            <CardDescription>Your deposit history and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">${deposit.amount.toFixed(2)}</TableCell>
                    <TableCell>{deposit.method}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {deposit.transactionHash ? (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => copyToClipboard(deposit.transactionHash!)}
                          title="Click to copy"
                        >
                          {deposit.transactionHash.slice(0, 8)}...{deposit.transactionHash.slice(-8)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {deposits.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No deposits yet</h3>
                <p className="text-gray-600">Make your first deposit to start investing.</p>
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

      {/* Deposit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make a Deposit</DialogTitle>
            <DialogDescription>
              Fill in the deposit details for {selectedMethod?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {selectedMethod && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Method:</span>
                    <span className="text-sm">{selectedMethod.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium">Limits:</span>
                    <span className="text-sm">${selectedMethod.minAmount} - ${selectedMethod.maxAmount}</span>
                  </div>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min={selectedMethod?.minAmount || 0}
                  max={selectedMethod?.maxAmount || undefined}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="transactionHash">Transaction Hash</Label>
                <Input
                  id="transactionHash"
                  value={formData.transactionHash}
                  onChange={(e) => setFormData({ ...formData, transactionHash: e.target.value })}
                  placeholder="Enter transaction hash (optional)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}