'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Settings, Upload, Save } from 'lucide-react'

interface SettingsData {
  id: string
  app_name: string
  logo?: string
  phone?: string
  currency: string
  deposit_bonus: number
  allow_deposit_bonus: boolean
  withdraw_enabled: boolean
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    id: '',
    app_name: 'Investment App',
    logo: '',
    phone: '',
    currency: 'USD',
    deposit_bonus: 0,
    allow_deposit_bonus: false,
    withdraw_enabled: true
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, logo: data.url }))
        toast.success('Logo uploaded successfully')
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage application settings</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app_name">App Name</Label>
                <Input
                  id="app_name"
                  value={settings.app_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, app_name: e.target.value }))}
                  placeholder="Enter app name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="Enter currency code (e.g., USD)"
              />
            </div>

            <div>
              <Label>App Logo</Label>
              <div className="flex items-center gap-4">
                {settings.logo && (
                  <img
                    src={settings.logo}
                    alt="App Logo"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deposit Bonus</Label>
                <p className="text-sm text-muted-foreground">
                  Enable bonus on first deposit
                </p>
              </div>
              <Switch
                checked={settings.allow_deposit_bonus}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_deposit_bonus: checked }))}
              />
            </div>

            {settings.allow_deposit_bonus && (
              <div>
                <Label htmlFor="deposit_bonus">Deposit Bonus Amount</Label>
                <Input
                  id="deposit_bonus"
                  type="number"
                  step="0.01"
                  value={settings.deposit_bonus}
                  onChange={(e) => setSettings(prev => ({ ...prev, deposit_bonus: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter bonus amount"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Withdrawals</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to request withdrawals
                </p>
              </div>
              <Switch
                checked={settings.withdraw_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, withdraw_enabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}