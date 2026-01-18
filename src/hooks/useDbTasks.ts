import { useState, useCallback, useMemo, useEffect } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { Task, Status, Priority } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useDbTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tasks from database
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        priority: t.priority as Priority,
        status: t.status as Status,
        category: t.category || 'Personal',
        tags: t.tags || [],
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
        completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load tasks.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, filterPriority, filterCategory]);

  const addTask = useCallback(async (task: Task) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        user_id: user.id,
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        status: task.status,
        category: task.category,
        tags: task.tags,
        due_date: task.dueDate?.toISOString() || null,
        completed_at: task.completedAt?.toISOString() || null,
      });

      if (error) throw error;
      
      setTasks(prev => [task, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add task.',
      });
    }
  }, [user, toast]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description || null,
          priority: updatedTask.priority,
          status: updatedTask.status,
          category: updatedTask.category,
          tags: updatedTask.tags,
          due_date: updatedTask.dueDate?.toISOString() || null,
          completed_at: updatedTask.completedAt?.toISOString() || null,
        })
        .eq('id', updatedTask.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task.',
      });
    }
  }, [user, toast]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete task.',
      });
    }
  }, [user, toast]);

  const changeTaskStatus = useCallback(async (taskId: string, status: Status) => {
    if (!user) return;

    const completedAt = status === 'done' ? new Date() : null;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status,
          completed_at: completedAt?.toISOString() || null,
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
                ...task,
                status,
                updatedAt: new Date(),
                completedAt: completedAt || undefined,
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error changing task status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task status.',
      });
    }
  }, [user, toast]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Status;
    changeTaskStatus(draggableId, newStatus);
  }, [changeTaskStatus]);

  const saveTask = useCallback(async (task: Task) => {
    const exists = tasks.find(t => t.id === task.id);
    if (exists) {
      await updateTask(task);
    } else {
      await addTask(task);
    }
  }, [tasks, updateTask, addTask]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    return { total, completed, inProgress, todo, overdue };
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    handleDragEnd,
    saveTask,
    stats,
    refetch: fetchTasks,
  };
};
