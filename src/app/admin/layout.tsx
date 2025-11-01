'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

const menuItems = [
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Package, label: 'Packages', href: '/admin/packages' },
  { icon: CreditCard, label: 'Payment Methods', href: '/admin/payment-methods' },
  { icon: DollarSign, label: 'Deposits', href: '/admin/deposits' },
  { icon: TrendingUp, label: 'Withdrawals', href: '/admin/withdrawals' },
  { icon: Package, label: 'Purchases', href: '/admin/purchases' },
  { icon: Gift, label: 'Tasks', href: '/admin/tasks' },
  { icon: Gift, label: 'Bonus Codes', href: '/admin/bonus-codes' },
  { icon: Users, label: 'Referral Commissions', href: '/admin/referral-commissions' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: User, label: 'Profile', href: '/admin/profile' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/profile')
      if (response.ok) {
        const data = await response.json()
        setAdminName(data.username)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      router.push('/admin/login')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
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
                variant={pathname === item.href ? 'default' : 'ghost'}
                className={`w-full justify-start ${pathname === item.href ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
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
              <h2 className="text-lg font-semibold text-gray-800">
                {pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1) || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {adminName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}