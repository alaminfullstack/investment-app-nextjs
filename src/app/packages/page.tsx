'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star, 
  CheckCircle,
  ArrowRight,
  Gift,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  dailyIncome: number;
  validity: number;
  totalIncome: number;
  status: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface PackagesResponse {
  packages: Package[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (!response.ok) throw new Error('Failed to fetch packages');

      const data: PackagesResponse = await response.json();
      setPackages(data.packages);
    } catch (error) {
      toast.error('Failed to load packages');
      console.error('Fetch packages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId: string) => {
    // Check if user is logged in
    const userResponse = await fetch('/api/auth/me');
    if (!userResponse.ok) {
      toast.error('Please login to purchase packages');
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase package');
      }

      toast.success('Package purchased successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase package');
      console.error('Purchase package error:', error);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'popular') return pkg.price >= 100;
    if (selectedCategory === 'starter') return pkg.price < 50;
    if (selectedCategory === 'premium') return pkg.price >= 500;
    return true;
  });

  const getPackageIcon = (pkg: Package) => {
    if (pkg.price >= 500) return <Shield className="w-8 h-8 text-purple-500" />;
    if (pkg.price >= 100) return <Star className="w-8 h-8 text-blue-500" />;
    return <Zap className="w-8 h-8 text-green-500" />;
  };

  const getPackageBadge = (pkg: Package) => {
    if (pkg.price >= 500) return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
    if (pkg.price >= 100) return <Badge className="bg-blue-100 text-blue-800">Popular</Badge>;
    return <Badge className="bg-green-100 text-green-800">Starter</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investment packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Investment Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of investment packages designed to meet your financial goals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="all">All Packages</TabsTrigger>
            <TabsTrigger value="starter">Starter</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Package Header */}
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  {getPackageIcon(pkg)}
                  {getPackageBadge(pkg)}
                </div>
                <CardTitle className="text-2xl font-bold mt-4">{pkg.title}</CardTitle>
                <CardDescription className="text-blue-100">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              {/* Package Content */}
              <CardContent className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">${pkg.price}</div>
                  <div className="text-gray-500">One-time investment</div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Daily Return</span>
                    </div>
                    <span className="font-semibold text-green-600">${pkg.dailyIncome}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">Validity</span>
                    </div>
                    <span className="font-semibold text-blue-600">{pkg.validity} days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700">Total Return</span>
                    </div>
                    <span className="font-semibold text-purple-600">${pkg.totalIncome}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-700">Profit</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      ${((pkg.totalIncome - pkg.price)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => handlePurchasePackage(pkg.id)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Invest Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">Check back later for new investment opportunities.</p>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Investment Packages?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Investment</h3>
              <p className="text-gray-600">Your investments are protected with industry-leading security measures.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Returns</h3>
              <p className="text-gray-600">Get guaranteed daily returns on your investment with transparent calculations.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-gray-600">Join thousands of satisfied investors earning consistent returns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}