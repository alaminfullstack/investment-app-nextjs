'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Users, 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle,
  CheckCircle,
  Gift,
  TrendingUp
} from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [emailData, setEmailData] = useState({
    recipient_email: '',
    message: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        const link = `${window.location.origin}/auth/register?ref=${data.user.ref_id}`
        setReferralLink(link)
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Referral link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const shareOnSocial = (platform: string) => {
    const text = 'Join me on this amazing investment platform and start earning today!'
    const url = referralLink
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const sendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailData.recipient_email) {
      toast.error('Please enter a recipient email')
      return
    }

    try {
      const response = await fetch('/api/invite/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      if (response.ok) {
        toast.success('Invitation sent successfully!')
        setEmailData({
          recipient_email: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send invitation')
      }
    } catch (error) {
      toast.error('Failed to send invitation')
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
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Invite & Earn
            </h1>
            <p className="text-xl text-blue-100">
              Share your referral link and earn commissions from your friends' investments
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Referral Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Referral Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {user.ref_id}
                  </div>
                  <p className="text-sm text-gray-600">Your Referral ID</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-semibold text-gray-900">0</div>
                    <p className="text-xs text-gray-600">Direct Referrals</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">$0</div>
                    <p className="text-xs text-gray-600">Commission Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Referral Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Earn up to 10% commission</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Multi-level commission system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Lifetime commission from referrals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Real-time commission tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button 
                      onClick={copyToClipboard}
                      variant={copied ? "default" : "outline"}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Share this link with your friends. When they sign up and invest, you'll earn commissions!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Share on Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial('facebook')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded" />
                    <span>Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial('twitter')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-sky-500 rounded" />
                    <span>Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial('whatsapp')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial('telegram')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-blue-500 rounded" />
                    <span>Telegram</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Invitation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Email Invitation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendEmailInvite} className="space-y-4">
                  <div>
                    <Label htmlFor="recipient_email">Recipient Email</Label>
                    <Input
                      id="recipient_email"
                      type="email"
                      value={emailData.recipient_email}
                      onChange={(e) => setEmailData(prev => ({ ...prev, recipient_email: e.target.value }))}
                      placeholder="friend@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Hi! I found this great investment platform and thought you might be interested..."
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Share Your Link</h4>
                    <p className="text-sm text-gray-600">
                      Share your unique referral link with friends and family
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">They Join & Invest</h4>
                    <p className="text-sm text-gray-600">
                      When they sign up and make their first investment
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">You Earn Commissions</h4>
                    <p className="text-sm text-gray-600">
                      Receive commissions on their investments for life
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}