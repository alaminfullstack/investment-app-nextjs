'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Users, Plus, Edit, Trash2, TrendingUp } from 'lucide-react'

interface ReferralCommission {
  id: string
  level: number
  name: string
  commission: number
  status: string
  createdAt: string
}

export default function AdminReferralCommissions() {
  const [commissions, setCommissions] = useState<ReferralCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommission, setEditingCommission] = useState<ReferralCommission | null>(null)
  const [formData, setFormData] = useState({
    level: 1,
    name: '',
    commission: 0,
    status: 'active'
  })

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      const response = await fetch('/api/admin/referral-commissions')
      if (response.ok) {
        const data = await response.json()
        setCommissions(data)
      }
    } catch (error) {
      toast.error('Failed to fetch referral commissions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCommission 
        ? `/api/admin/referral-commissions/${editingCommission.id}`
        : '/api/admin/referral-commissions'
      
      const method = editingCommission ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(`Referral commission ${editingCommission ? 'updated' : 'created'} successfully`)
        setIsDialogOpen(false)
        setEditingCommission(null)
        resetForm()
        fetchCommissions()
      } else {
        throw new Error('Failed to save referral commission')
      }
    } catch (error) {
      toast.error('Failed to save referral commission')
    }
  }

  const handleEdit = (commission: ReferralCommission) => {
    setEditingCommission(commission)
    setFormData({
      level: commission.level,
      name: commission.name,
      commission: commission.commission,
      status: commission.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral commission?')) return
    
    try {
      const response = await fetch(`/api/admin/referral-commissions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Referral commission deleted successfully')
        fetchCommissions()
      } else {
        throw new Error('Failed to delete referral commission')
      }
    } catch (error) {
      toast.error('Failed to delete referral commission')
    }
  }

  const resetForm = () => {
    setFormData({
      level: 1,
      name: '',
      commission: 0,
      status: 'active'
    })
  }

  const openCreateDialog = () => {
    setEditingCommission(null)
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Commissions</h1>
          <p className="text-muted-foreground">Manage multi-level referral commission system</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Commission Level
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCommission ? 'Edit Commission Level' : 'Add Commission Level'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Direct Referral"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCommission ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Commission Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No commission levels found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first referral commission level to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Commission Level
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <span className="text-sm font-medium">L{commission.level}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{commission.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {commission.commission}% commission
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={commission.status === 'active' ? 'default' : 'secondary'}>
                      {commission.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(commission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(commission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}