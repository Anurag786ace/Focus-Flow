import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  };
}

const statItems = [
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'todo',
    label: 'To Do',
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
] as const;

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", item.bgColor)}>
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats[item.key]}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
