import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gray-50">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="Z.ai Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Investment App</h1>
        <p className="text-lg text-gray-600">Choose your portal to continue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Panel
            </CardTitle>
            <CardDescription>
              Manage users, packages, deposits, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/login">
              <Button className="w-full">
                Access Admin Panel
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Portal
            </CardTitle>
            <CardDescription>
              Login or register to start investing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full" variant="outline">
                Access User Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}