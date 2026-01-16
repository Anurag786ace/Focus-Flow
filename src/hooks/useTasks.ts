import { useState, useCallback, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { Task, Status } from '@/types/task';

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page design with animations',
    priority: 'high',
    status: 'in-progress',
    category: 'Work',
    tags: ['design', 'important'],
    dueDate: new Date(Date.now() + 86400000 * 2),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review the pull requests from the team',
    priority: 'medium',
    status: 'todo',
    category: 'Work',
    tags: ['review'],
    dueDate: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Update the API documentation with new endpoints',
    priority: 'low',
    status: 'todo',
    category: 'Work',
    tags: ['feature'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Fix navigation bug',
    description: 'The mobile navigation menu is not closing properly',
    priority: 'high',
    status: 'todo',
    category: 'Work',
    tags: ['bug', 'urgent'],
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Schedule team meeting',
    description: 'Organize weekly sync with the development team',
    priority: 'medium',
    status: 'done',
    category: 'Work',
    tags: ['meeting'],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: '6',
    title: 'Research new technologies',
    description: 'Explore new frontend frameworks and tools',
    priority: 'low',
    status: 'in-progress',
    category: 'Learning',
    tags: ['research'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const changeTaskStatus = useCallback((taskId: string, status: Status) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date(),
              completedAt: status === 'done' ? new Date() : undefined,
            }
          : task
      )
    );
  }, []);

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

  const saveTask = useCallback((task: Task) => {
    const exists = tasks.find(t => t.id === task.id);
    if (exists) {
      updateTask(task);
    } else {
      addTask(task);
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
  };
};
