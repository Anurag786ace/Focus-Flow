import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, CATEGORIES } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, MoreHorizontal, Clock, Calendar } from 'lucide-react';

interface AllTasksViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
}

const priorityColors = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

const statusColors = {
  todo: 'bg-muted/50 text-muted-foreground',
  'in-progress': 'bg-primary/10 text-primary',
  done: 'bg-success/10 text-success',
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Completed',
};

export const AllTasksView = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: AllTasksViewProps) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filterCategory, filterPriority, filterStatus, sortBy, searchQuery]);

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
    });
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date().getHours() > 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Filters */}
      <Card className="p-6 glass shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary/50 border-0"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-secondary/50 border-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="bg-secondary/50 border-0">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-secondary/50 border-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card className="glass shadow-card overflow-hidden">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead className="w-[15%]">Category</TableHead>
                  <TableHead className="w-[12%]">Priority</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%]">Due Date</TableHead>
                  <TableHead className="w-[13%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground truncate max-w-xs">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/50">
                        {task.category || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className={isOverdue(task.dueDate) ? 'text-destructive font-medium' : ''}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTask(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {task.status !== 'done' && (
                            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Done
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDeleteTask(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass shadow-card">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {filteredAndSortedTasks.length}
          </p>
        </Card>
        <Card className="p-4 glass shadow-card">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {filteredAndSortedTasks.filter(t => t.status === 'in-progress').length}
          </p>
        </Card>
        <Card className="p-4 glass shadow-card">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success mt-1">
            {filteredAndSortedTasks.filter(t => t.status === 'done').length}
          </p>
        </Card>
        <Card className="p-4 glass shadow-card">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-destructive mt-1">
            {filteredAndSortedTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length}
          </p>
        </Card>
      </div>
    </motion.div>
  );
};
