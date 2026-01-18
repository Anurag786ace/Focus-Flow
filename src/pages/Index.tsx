import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/task/KanbanBoard';
import { TaskDialog } from '@/components/task/TaskDialog';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useDbTasks } from '@/hooks/useDbTasks';
import { Task, Status } from '@/types/task';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  const {
    tasks,
    allTasks,
    loading,
    searchQuery,
    setSearchQuery,
    deleteTask,
    changeTaskStatus,
    handleDragEnd,
    saveTask,
    stats,
  } = useDbTasks();

  const handleNewTask = useCallback((status?: Status) => {
    setEditingTask(null);
    setDefaultStatus(status || 'todo');
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const getSubtitle = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return `${today} • ${stats.total} tasks`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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
        className="min-h-screen transition-colors duration-300"
      >
        <div className="p-6 lg:p-8 max-w-[1600px]">
          <Header title="Task Board" subtitle={getSubtitle()} />

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* Views */}
          <AnimatePresence mode="wait">
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

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnalyticsDashboard tasks={allTasks} />
              </motion.div>
            )}

            {activeView !== 'board' && activeView !== 'analytics' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              >
                <p className="text-lg font-medium">
                  {activeView === 'tasks' && 'All Tasks View'}
                  {activeView === 'calendar' && 'Calendar View'}
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
