'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Gift, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  balance: number
}

interface BonusCodeUsage {
  id: string
  bonus_code: {
    code: string
    income_amount: number
  }
  status: string
  createdAt: string
}

export default function BonusCodesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [bonusCode, setBonusCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [usedCodes, setUsedCodes] = useState<BonusCodeUsage[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchUsedCodes()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsedCodes = async () => {
    try {
      const response = await fetch('/api/bonus-codes/used')
      if (response.ok) {
        const data = await response.json()
        setUsedCodes(data)
      }
    } catch (error) {
      console.error('Failed to fetch used codes:', error)
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bonusCode.trim()) {
      toast.error('Please enter a bonus code')
      return
    }

    setRedeeming(true)
    try {
      const response = await fetch('/api/bonus-codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: bonusCode.trim().toUpperCase() })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Bonus code redeemed! $${data.bonus_amount} added to your balance`)
        setBonusCode('')
        fetchUserData()
        fetchUsedCodes()
      } else {
        toast.error(data.error || 'Failed to redeem bonus code')
      }
    } catch (error) {
      toast.error('Failed to redeem bonus code')
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">Bonus Codes</h1>
            </div>
            <div className="text-sm text-gray-600">
              Current Balance: <span className="font-semibold text-green-600">${user.balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Redeem Bonus Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Redeem Bonus Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <Label htmlFor="code">Enter Bonus Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={bonusCode}
                    onChange={(e) => setBonusCode(e.target.value.toUpperCase())}
                    placeholder="Enter your bonus code"
                    className="uppercase"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={redeeming || !bonusCode.trim()}
                >
                  {redeeming ? 'Redeeming...' : 'Redeem Code'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to use bonus codes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Enter a valid bonus code above</li>
                  <li>• Click "Redeem Code" to claim your bonus</li>
                  <li>• Bonus amount will be added to your balance</li>
                  <li>• Each code can only be used once</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Used Bonus Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Your Bonus History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usedCodes.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bonus codes used yet</h3>
                  <p className="text-muted-foreground">
                    Redeem your first bonus code to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {usedCodes.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{usage.bonus_code.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(usage.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +${usage.bonus_code.income_amount.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {usage.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="mx-auto h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-medium mb-2">Exclusive Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get bonus funds added directly to your balance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-4" />
              <h3 className="font-medium mb-2">Instant Credit</h3>
              <p className="text-sm text-muted-foreground">
                Bonus amounts are credited immediately upon redemption
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="mx-auto h-8 w-8 text-red-600 mb-4" />
              <h3 className="font-medium mb-2">One-Time Use</h3>
              <p className="text-sm text-muted-foreground">
                Each bonus code can only be used once per user
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}