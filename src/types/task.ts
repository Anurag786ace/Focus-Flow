export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  category?: string;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Column {
  id: Status;
  title: string;
  tasks: Task[];
}

export const CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Learning',
  'Home',
] as const;

export const DEFAULT_TAGS = [
  'urgent',
  'important',
  'meeting',
  'review',
  'bug',
  'feature',
  'design',
  'research',
] as const;
