'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Copy,
  Calendar,
  Search,
  Crown,
  Star,
  Award,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  ref_id: string;
  status: string;
  balance: number;
  deposit_balance: number;
  createdAt: string;
  _count: {
    deposits: number;
    purchases: number;
  };
  level?: number;
}

interface TeamStats {
  totalDirectReferrals: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  totalReferralEarnings: number;
  activeMembers: number;
  totalBalance: number;
  totalDepositBalance: number;
}

interface TeamResponse {
  directReferrals: TeamMember[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: TeamStats;
  allTeamMembers: TeamMember[];
}

export default function TeamPage() {
  const [teamData, setTeamData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRefId, setUserRefId] = useState('');

  useEffect(() => {
    fetchTeamData();
    fetchUserData();
  }, [currentPage]);

  const fetchTeamData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/team?${params}`);
      if (!response.ok) throw new Error('Failed to fetch team data');

      const data: TeamResponse = await response.json();
      setTeamData(data);
    } catch (error) {
      toast.error('Failed to load team data');
      console.error('Fetch team data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserRefId(data.user.ref_id);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/register?ref=${userRefId}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralId = () => {
    navigator.clipboard.writeText(userRefId);
    toast.success('Referral ID copied to clipboard!');
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

  const getLevelBadge = (level?: number) => {
    if (!level) return null;
    
    switch (level) {
      case 1:
        return <Badge className="bg-blue-100 text-blue-800">Level 1</Badge>;
      case 2:
        return <Badge className="bg-purple-100 text-purple-800">Level 2</Badge>;
      case 3:
        return <Badge className="bg-orange-100 text-orange-800">Level 3</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Level {level}</Badge>;
    }
  };

  const filteredDirectReferrals = teamData?.directReferrals.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.ref_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAllMembers = teamData?.allTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.ref_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No team data available</h3>
          <p className="text-gray-600">Start building your team by inviting new members.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
              <p className="text-gray-600 mt-2">Manage your referral network and track earnings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={copyReferralLink} className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Copy Referral Link</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Referral Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span>Your Referral Information</span>
            </CardTitle>
            <CardDescription>Share these details to invite new members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral ID</label>
                <div className="flex items-center space-x-2">
                  <Input value={userRefId} readOnly className="font-mono" />
                  <Button variant="outline" size="sm" onClick={copyReferralId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Link</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={`${window.location.origin}/auth/register?ref=${userRefId}`} 
                    readOnly 
                    className="font-mono text-sm" 
                  />
                  <Button variant="outline" size="sm" onClick={copyReferralLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamData.stats.totalDirectReferrals}</div>
              <p className="text-xs text-muted-foreground">
                Level 1 team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamData.stats.totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                All levels combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamData.stats.activeTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${teamData.stats.totalReferralEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total earned from referrals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Tabs defaultValue="direct" className="space-y-6">
          <TabsList>
            <TabsTrigger value="direct">Direct Referrals</TabsTrigger>
            <TabsTrigger value="all">All Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>Direct Referrals (Level 1)</CardTitle>
                <CardDescription>Members who joined using your referral link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Deposits</TableHead>
                      <TableHead>Packages</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDirectReferrals.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                            <div className="text-xs text-muted-foreground font-mono">{member.ref_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="font-medium">${member.balance.toFixed(2)}</TableCell>
                        <TableCell>{member._count.deposits}</TableCell>
                        <TableCell>{member._count.purchases}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredDirectReferrals.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No direct referrals yet</h3>
                    <p className="text-gray-600">Start sharing your referral link to build your team.</p>
                  </div>
                )}

                {/* Pagination */}
                {teamData.pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {teamData.pagination.pages}
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
                        disabled={currentPage === teamData.pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Team Members</CardTitle>
                <CardDescription>Your entire referral network across all levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                            <div className="text-xs text-muted-foreground font-mono">{member.ref_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(member.level)}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="font-medium">${member.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredAllMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members found</h3>
                    <p className="text-gray-600">Start building your team by inviting new members.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}