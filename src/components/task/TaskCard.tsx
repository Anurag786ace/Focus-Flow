import { motion } from 'framer-motion';
import { Calendar, Tag, MoreHorizontal, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Task, Priority } from '@/types/task';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  isDragging?: boolean;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'priority-high' },
  medium: { label: 'Medium', className: 'priority-medium' },
  low: { label: 'Low', className: 'priority-low' },
};

const formatDueDate = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
};

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDragging = false,
}: TaskCardProps) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const priorityStyle = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group p-4 rounded-xl bg-card border border-border shadow-card transition-all duration-200",
        "hover:shadow-card-hover hover:border-primary/20",
        isDragging && "shadow-xl rotate-2 scale-105",
        task.status === 'done' && "opacity-70"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={cn(
          "font-medium text-card-foreground leading-snug",
          task.status === 'done' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
              Move to To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in-progress')}>
              Move to In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
              Move to Done
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
        <Badge variant="outline" className={cn("text-xs border", priorityStyle.className)}>
          {priorityStyle.label}
        </Badge>

        <div className="flex items-center gap-2">
          {task.category && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {task.category}
            </span>
          )}
          {task.dueDate && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {formatDueDate(new Date(task.dueDate))}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
