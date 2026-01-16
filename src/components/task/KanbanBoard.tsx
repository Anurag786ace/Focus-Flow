import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, Status } from '@/types/task';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onReorder: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Status) => void;
  onAddTask: (status: Status) => void;
}

const columns: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export const KanbanBoard = ({
  tasks,
  onReorder,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTask,
}: KanbanBoardProps) => {
  const getTasksByStatus = (status: Status) => 
    tasks.filter(task => task.status === status);

  return (
    <DragDropContext onDragEnd={onReorder}>
      <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStatusChange={onStatusChange}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
