'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Gift, Plus, Edit, Trash2, Users, DollarSign } from 'lucide-react'

interface BonusCode {
  id: string
  code: string
  income_amount: number
  status: string
  createdAt: string
  _count: {
    usages: number
  }
}

export default function AdminBonusCodes() {
  const [bonusCodes, setBonusCodes] = useState<BonusCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<BonusCode | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    income_amount: 0,
    status: 'active'
  })

  useEffect(() => {
    fetchBonusCodes()
  }, [])

  const fetchBonusCodes = async () => {
    try {
      const response = await fetch('/api/admin/bonus-codes')
      if (response.ok) {
        const data = await response.json()
        setBonusCodes(data)
      }
    } catch (error) {
      toast.error('Failed to fetch bonus codes')
    } finally {
      setLoading(false)
    }
  }

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCode 
        ? `/api/admin/bonus-codes/${editingCode.id}`
        : '/api/admin/bonus-codes'
      
      const method = editingCode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(`Bonus code ${editingCode ? 'updated' : 'created'} successfully`)
        setIsDialogOpen(false)
        setEditingCode(null)
        resetForm()
        fetchBonusCodes()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save bonus code')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save bonus code')
    }
  }

  const handleEdit = (code: BonusCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      income_amount: code.income_amount,
      status: code.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bonus code?')) return
    
    try {
      const response = await fetch(`/api/admin/bonus-codes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Bonus code deleted successfully')
        fetchBonusCodes()
      } else {
        throw new Error('Failed to delete bonus code')
      }
    } catch (error) {
      toast.error('Failed to delete bonus code')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      income_amount: 0,
      status: 'active'
    })
  }

  const openCreateDialog = () => {
    setEditingCode(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const generateCode = () => {
    setFormData(prev => ({ ...prev, code: generateRandomCode() }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonus Codes</h1>
          <p className="text-muted-foreground">Manage promotional bonus codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bonus Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Edit Bonus Code' : 'Add Bonus Code'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Bonus Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="Enter bonus code"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="income_amount">Bonus Amount</Label>
                <Input
                  id="income_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.income_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, income_amount: parseFloat(e.target.value) }))}
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
                  {editingCode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bonusCodes.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No bonus codes found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first bonus code to reward users
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bonus Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bonusCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{code.code}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${code.income_amount}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {code._count.usages} uses
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={code.status === 'active' ? 'default' : 'secondary'}>
                      {code.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(code)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
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