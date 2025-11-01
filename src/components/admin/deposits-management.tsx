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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: string;
  transactionHash?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
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

export default function DepositsManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    method: '',
    transactionHash: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: '',
  });

  const fetchDeposits = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('userId', searchTerm);
      }

      const response = await fetch(`/api/admin/deposits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deposits');

      const data: DepositsResponse = await response.json();
      setDeposits(data.deposits);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch deposits');
      console.error('Fetch deposits error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [currentPage, statusFilter, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create deposit');

      toast.success('Deposit created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchDeposits();
    } catch (error) {
      toast.error('Failed to create deposit');
      console.error('Create deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/deposits/${selectedDeposit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update deposit');

      toast.success('Deposit updated successfully');
      setIsEditDialogOpen(false);
      setSelectedDeposit(null);
      resetForm();
      fetchDeposits();
    } catch (error) {
      toast.error('Failed to update deposit');
      console.error('Update deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/deposits/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete deposit');

      toast.success('Deposit deleted successfully');
      fetchDeposits();
    } catch (error) {
      toast.error('Failed to delete deposit');
      console.error('Delete deposit error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      amount: '',
      method: '',
      transactionHash: '',
      status: 'pending',
      notes: '',
    });
  };

  const openEditDialog = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setFormData({
      userId: deposit.userId,
      amount: deposit.amount.toString(),
      method: deposit.method,
      transactionHash: deposit.transactionHash || '',
      status: deposit.status,
      notes: deposit.notes || '',
    });
    setIsEditDialogOpen(true);
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading deposits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deposits Management</h1>
          <p className="text-muted-foreground">Manage user deposit requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Deposit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Deposit</DialogTitle>
              <DialogDescription>
                Add a new deposit record for a user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Input
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    placeholder="e.g., Bank Transfer, USDT"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transactionHash">Transaction Hash</Label>
                  <Input
                    id="transactionHash"
                    value={formData.transactionHash}
                    onChange={(e) => setFormData({ ...formData, transactionHash: e.target.value })}
                    placeholder="Transaction hash (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Deposit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposits</CardTitle>
          <CardDescription>View and manage all deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deposit.user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{deposit.user.username}</div>
                      <div className="text-xs text-muted-foreground">{deposit.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${deposit.amount.toFixed(2)}</TableCell>
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
                  <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                  <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(deposit)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this deposit record. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(deposit.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Deposit</DialogTitle>
            <DialogDescription>
              Update the deposit information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-method">Payment Method</Label>
                <Input
                  id="edit-method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  placeholder="e.g., Bank Transfer, USDT"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-transactionHash">Transaction Hash</Label>
                <Input
                  id="edit-transactionHash"
                  value={formData.transactionHash}
                  onChange={(e) => setFormData({ ...formData, transactionHash: e.target.value })}
                  placeholder="Transaction hash (optional)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Deposit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}