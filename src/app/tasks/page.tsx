'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Gift, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  DollarSign,
  Target,
  Star,
  Zap,
  Award,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  reward: number;
  type: string;
  status: 'pending' | 'completed' | 'expired';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [activeTab, currentPage]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'available' ? 'pending' : activeTab === 'completed' ? 'completed' : 'expired';
      const params = new URLSearchParams({
        status,
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data: TasksResponse = await response.json();
      setTasks(data.tasks);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    setIsClaiming(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim task');
      }

      const data = await response.json();
      toast.success(data.message);
      setIsClaimDialogOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim task');
      console.error('Claim task error:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const openClaimDialog = (task: Task) => {
    setSelectedTask(task);
    setIsClaimDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'weekly':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'monthly':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'special':
        return <Star className="w-5 h-5 text-orange-500" />;
      default:
        return <Gift className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'daily':
        return <Badge variant="secondary">Daily</Badge>;
      case 'weekly':
        return <Badge variant="outline">Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-blue-100 text-blue-800">Monthly</Badge>;
      case 'special':
        return <Badge className="bg-purple-100 text-purple-800">Special</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const isTaskExpired = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Task Center</h1>
              <p className="text-gray-600 mt-2">Complete tasks to earn rewards</p>
            </div>
            <Button variant="outline" onClick={fetchTasks}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${tasks.filter(t => t.status === 'completed').reduce((sum, task) => sum + task.reward, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From completed tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.filter(task => task.status === 'pending').map((task) => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isExpired = isTaskExpired(task);
                
                return (
                  <Card key={task.id} className={`hover:shadow-lg transition-shadow ${isExpired ? 'opacity-75' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(task.type)}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                        </div>
                        {getTypeBadge(task.type)}
                      </div>
                      {task.description && (
                        <CardDescription>{task.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Reward:</span>
                          <span className="text-lg font-bold text-green-600">${task.reward.toFixed(2)}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Due Date:</span>
                            <div className="text-right">
                              <div className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</div>
                              {daysRemaining !== null && (
                                <div className={`text-xs ${daysRemaining <= 1 ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                  {isExpired ? 'Expired' : `${daysRemaining} days left`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => openClaimDialog(task)}
                          className="w-full"
                          disabled={isExpired || isClaiming}
                        >
                          {isExpired ? 'Expired' : isClaiming ? 'Claiming...' : 'Claim Reward'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {tasks.filter(task => task.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No available tasks</h3>
                  <p className="text-gray-600">Check back later for new tasks to complete.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Tasks you have successfully completed</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.filter(task => task.status === 'completed').map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(task.type)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${task.reward.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(task.updatedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {tasks.filter(task => task.status === 'completed').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks</h3>
                    <p className="text-gray-600">Complete tasks to see them here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired">
            <Card>
              <CardHeader>
                <CardTitle>Expired Tasks</CardTitle>
                <CardDescription>Tasks that have expired and can no longer be completed</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.filter(task => task.status === 'expired').map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(task.type)}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          ${task.reward.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {tasks.filter(task => task.status === 'expired').length === 0 && (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No expired tasks</h3>
                    <p className="text-gray-600">Tasks that expire will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Claim Confirmation Dialog */}
        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Claim Task Reward</DialogTitle>
              <DialogDescription>
                Are you sure you want to claim the reward for this task?
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedTask.title}</h4>
                  {selectedTask.description && (
                    <p className="text-sm text-gray-600 mb-2">{selectedTask.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reward:</span>
                    <span className="text-lg font-bold text-green-600">${selectedTask.reward.toFixed(2)}</span>
                  </div>
                </div>
                
                {selectedTask.dueDate && (
                  <div className="flex items-center space-x-2 text-sm text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      This task expires on {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedTask && handleClaimTask(selectedTask.id)}
                disabled={isClaiming}
              >
                {isClaiming ? 'Claiming...' : 'Claim Reward'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}