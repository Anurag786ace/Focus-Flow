import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Task, Status } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: Status;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Status) => void;
  onAddTask: (status: Status) => void;
}

const columnConfig: Record<Status, { color: string; bgColor: string }> = {
  'todo': { 
    color: 'bg-status-todo',
    bgColor: 'bg-muted/30'
  },
  'in-progress': { 
    color: 'bg-status-progress',
    bgColor: 'bg-primary/5'
  },
  'done': { 
    color: 'bg-status-done',
    bgColor: 'bg-success/5'
  },
};

export const KanbanColumn = ({
  id,
  title,
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTask,
}: KanbanColumnProps) => {
  const config = columnConfig[id];

  return (
    <div className="flex flex-col min-w-[320px] max-w-[360px] w-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddTask(id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 space-y-3 p-3 rounded-xl min-h-[200px] transition-colors duration-200",
              config.bgColor,
              snapshot.isDraggingOver && "ring-2 ring-primary/20 ring-inset"
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">No tasks yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => onAddTask(id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add task
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </Droppable>
    </div>
  );
};
