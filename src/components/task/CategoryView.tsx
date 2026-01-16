import { motion, AnimatePresence } from 'framer-motion';
import { Task, CATEGORIES } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Edit, MoreHorizontal, Calendar } from 'lucide-react';

interface CategoryViewProps {
  tasks: Task[];
  selectedCategory?: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
}

const statusColors = {
  todo: 'bg-muted/50 text-muted-foreground',
  'in-progress': 'bg-primary/10 text-primary',
  done: 'bg-success/10 text-success',
};

const priorityColors = {
  high: 'bg-destructive/10 text-destructive border border-destructive/20',
  medium: 'bg-warning/10 text-warning border border-warning/20',
  low: 'bg-success/10 text-success border border-success/20',
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Completed',
};

export const CategoryView = ({
  tasks,
  selectedCategory,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: CategoryViewProps) => {
  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const categoriesToShow = selectedCategory
    ? [selectedCategory]
    : CATEGORIES;

  const formatDate = (date?: Date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <AnimatePresence mode="wait">
        {categoriesToShow.map((category, categoryIndex) => {
          const categoryTasks = getTasksByCategory(category);
          const todoCount = categoryTasks.filter(t => t.status === 'todo').length;
          const inProgressCount = categoryTasks.filter(t => t.status === 'in-progress').length;
          const doneCount = categoryTasks.filter(t => t.status === 'done').length;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{category}</h2>
                    <div className="flex gap-4 mt-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">{categoryTasks.length}</span> total
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-medium">{inProgressCount}</span> in progress
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-success font-medium">{doneCount}</span> done
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Tasks Grid */}
                {categoryTasks.length === 0 ? (
                  <Card className="p-8 text-center glass shadow-card">
                    <p className="text-muted-foreground">No tasks in {category}</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {categoryTasks.map((task, taskIndex) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: taskIndex * 0.05 }}
                        >
                          <Card className="glass shadow-card hover:shadow-card-hover transition-all p-4 group">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground truncate">
                                    {task.title}
                                  </h3>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
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
                              </div>

                              {/* Description */}
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Status & Priority */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={statusColors[task.status]}>
                                  {statusLabels[task.status]}
                                </Badge>
                                <Badge className={priorityColors[task.priority]}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </Badge>
                              </div>

                              {/* Tags */}
                              {task.tags.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  {task.tags.map(tag => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Due Date */}
                              {task.dueDate && (
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span
                                    className={`text-xs font-medium ${
                                      isOverdue(task.dueDate) && task.status !== 'done'
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {formatDate(task.dueDate)}
                                    {isOverdue(task.dueDate) && task.status !== 'done' && (
                                      <span className="ml-1 font-bold">⚠️ Overdue</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
