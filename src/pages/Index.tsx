import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/task/KanbanBoard';
import { AllTasksView } from '@/components/task/AllTasksView';
import { CategoryView } from '@/components/task/CategoryView';
import { TaskDialog } from '@/components/task/TaskDialog';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { useTasks } from '@/hooks/useTasks';
import { Task, Status } from '@/types/task';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  const {
    tasks,
    searchQuery,
    setSearchQuery,
    deleteTask,
    changeTaskStatus,
    handleDragEnd,
    saveTask,
    stats,
  } = useTasks();

  const handleNewTask = useCallback((status?: Status) => {
    setEditingTask(null);
    setDefaultStatus(status || 'todo');
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const getTitle = () => {
    if (activeView === 'board') return 'Task Board';
    if (activeView === 'tasks') return 'All Tasks';
    if (activeView === 'calendar') return 'Calendar';
    if (activeView === 'analytics') return 'Analytics';
    if (activeView.startsWith('category-')) {
      const category = activeView.replace('category-', '');
      return `${category} Tasks`;
    }
    return 'Tasks';
  };

  const getSubtitle = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return `${today} • ${stats.total} tasks`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onViewChange={setActiveView}
        onNewTask={() => handleNewTask()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? 72 : 280,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        <div className="p-6 lg:p-8 max-w-[1600px]">
          <Header title={getTitle()} subtitle={getSubtitle()} />

          {/* Stats - Show on board and all tasks view */}
          {(activeView === 'board' || activeView === 'tasks') && (
            <StatsCards stats={stats} />
          )}

          {/* View Content */}
          <AnimatePresence mode="wait">
            {/* Kanban Board View */}
            {activeView === 'board' && (
              <motion.div
                key="board"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <KanbanBoard
                  tasks={tasks}
                  onReorder={handleDragEnd}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                  onStatusChange={changeTaskStatus}
                  onAddTask={handleNewTask}
                />
              </motion.div>
            )}

            {/* All Tasks View */}
            {activeView === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AllTasksView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                  onStatusChange={changeTaskStatus}
                />
              </motion.div>
            )}

            {/* Category View */}
            {activeView.startsWith('category-') && (
              <motion.div
                key="category"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CategoryView
                  tasks={tasks}
                  selectedCategory={activeView.replace('category-', '')}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                  onStatusChange={changeTaskStatus}
                />
              </motion.div>
            )}

            {/* Placeholder Views */}
            {(activeView === 'calendar' || activeView === 'analytics') && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              >
                <p className="text-lg font-medium">
                  {activeView === 'calendar' && 'Calendar View'}
                  {activeView === 'analytics' && 'Analytics Dashboard'}
                </p>
                <p className="text-sm mt-2">Coming soon...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={saveTask}
      />
    </div>
  );
};

export default Index;
