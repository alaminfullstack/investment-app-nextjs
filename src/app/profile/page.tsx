'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package,
  Gift,
  Users,
  History,
  Edit,
  Save,
  Eye,
  EyeOff,
  Copy,
  Shield,
  Target,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ref_id: string;
  ref_by?: string;
  status: string;
  balance: number;
  deposit_balance: number;
  payment_method?: string;
  method_number?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    deposits: number;
    withdrawals: number;
    purchases: number;
    tasks: number;
  };
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalPurchases: number;
  activePurchases: number;
  completedTasks: number;
  referralCount: number;
  totalEarnings: number;
}

interface Activity {
  id: string;
  type: string;
  amount: number;
  description: string;
  balance: number;
  createdAt: string;
}

interface ProfileResponse {
  user: UserProfile;
  stats: UserStats;
  recentActivities: Activity[];
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    payment_method: '',
    method_number: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile data');

      const data: ProfileResponse = await response.json();
      setProfileData(data);
      
      // Initialize form data
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        payment_method: data.user.payment_method || '',
        method_number: data.user.method_number || '',
        currentPassword: '',
        newPassword: '',
      });
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error('Fetch profile data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setIsEditDialogOpen(false);
      fetchProfileData();
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralId = () => {
    if (profileData?.user.ref_id) {
      navigator.clipboard.writeText(profileData.user.ref_id);
      toast.success('Referral ID copied to clipboard!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account information and view statistics</p>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information and security settings.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Input
                        id="payment_method"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        placeholder="e.g., Bank Transfer, USDT"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="method_number">Payment Account Number</Label>
                      <Input
                        id="method_number"
                        value={formData.method_number}
                        onChange={(e) => setFormData({ ...formData, method_number: e.target.value })}
                        placeholder="Account or wallet number"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Change Password</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profileData.user.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(profileData.user.status)}
                      <span className="text-sm text-gray-500">
                        Member since {new Date(profileData.user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{profileData.user.email}</span>
                  </div>
                  {profileData.user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{profileData.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-mono">{profileData.user.ref_id}</span>
                    <Button variant="ghost" size="sm" onClick={copyReferralId}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {profileData.user.payment_method && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{profileData.user.payment_method}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Balances */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Account Balances</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Balance</span>
                    <span className="text-lg font-bold text-green-600">
                      ${profileData.user.balance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Available for withdrawal</p>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deposit Balance</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${profileData.user.deposit_balance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Available for investments</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Activities */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="stats" className="space-y-6">
              <TabsList>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${profileData.stats.totalDeposits.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {profileData.user._count.deposits} deposit transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${profileData.stats.totalWithdrawals.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {profileData.user._count.withdrawals} withdrawal transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{profileData.stats.activePurchases}</div>
                      <p className="text-xs text-muted-foreground">
                        ${profileData.stats.totalPurchases.toFixed(2)} total investment
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                      <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{profileData.stats.completedTasks}</div>
                      <p className="text-xs text-muted-foreground">
                        {profileData.user._count.tasks} total tasks
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Referral Count</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{profileData.stats.referralCount}</div>
                      <p className="text-xs text-muted-foreground">
                        Direct referrals
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${profileData.stats.totalEarnings.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        All-time earnings
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest account transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profileData.recentActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getActivityIcon(activity.type)}
                                <span className="capitalize">{activity.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {activity.description}
                            </TableCell>
                            <TableCell className={activity.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              {activity.amount > 0 ? '+' : ''}${activity.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>${activity.balance.toFixed(2)}</TableCell>
                            <TableCell>
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {profileData.recentActivities.length === 0 && (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                        <p className="text-gray-600">Your account activity will appear here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}