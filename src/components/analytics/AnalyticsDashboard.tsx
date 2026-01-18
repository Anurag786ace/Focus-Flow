import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Target, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types/task';

interface AnalyticsDashboardProps {
  tasks: Task[];
}

const PRIORITY_COLORS = {
  high: 'hsl(0, 84%, 60%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(142, 76%, 36%)',
};

const STATUS_COLORS = {
  todo: 'hsl(220, 9%, 46%)',
  'in-progress': 'hsl(221, 83%, 53%)',
  done: 'hsl(142, 76%, 36%)',
};

export const AnalyticsDashboard = ({ tasks }: AnalyticsDashboardProps) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const tasksWithDueDate = tasks.filter(t => t.dueDate);
    const onTime = tasksWithDueDate.filter(t => 
      t.status === 'done' && t.completedAt && t.dueDate && 
      new Date(t.completedAt) <= new Date(t.dueDate)
    ).length;
    const onTimeRate = tasksWithDueDate.length > 0 
      ? Math.round((onTime / tasksWithDueDate.filter(t => t.status === 'done').length) * 100) || 0
      : 0;

    return { total, completed, completionRate, onTimeRate };
  }, [tasks]);

  const priorityData = useMemo(() => {
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    tasks.forEach(t => priorityCounts[t.priority]++);
    return [
      { name: 'High', value: priorityCounts.high, fill: PRIORITY_COLORS.high },
      { name: 'Medium', value: priorityCounts.medium, fill: PRIORITY_COLORS.medium },
      { name: 'Low', value: priorityCounts.low, fill: PRIORITY_COLORS.low },
    ];
  }, [tasks]);

  const statusData = useMemo(() => {
    const statusCounts = { todo: 0, 'in-progress': 0, done: 0 };
    tasks.forEach(t => statusCounts[t.status]++);
    return [
      { name: 'To Do', value: statusCounts.todo, fill: STATUS_COLORS.todo },
      { name: 'In Progress', value: statusCounts['in-progress'], fill: STATUS_COLORS['in-progress'] },
      { name: 'Done', value: statusCounts.done, fill: STATUS_COLORS.done },
    ];
  }, [tasks]);

  const categoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    tasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const created = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      const completed = tasks.filter(t => {
        if (!t.completedAt) return false;
        const taskDate = new Date(t.completedAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      weekData.push({ name: dayName, created, completed });
    }

    return weekData;
  }, [tasks]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.completionRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.onTimeRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Activity</CardTitle>
              <CardDescription>Tasks created vs completed over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="created" 
                    stackId="1"
                    stroke="hsl(221, 83%, 53%)" 
                    fill="hsl(221, 83%, 53%, 0.3)" 
                    name="Created"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="2"
                    stroke="hsl(142, 76%, 36%)" 
                    fill="hsl(142, 76%, 36%, 0.3)" 
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Tasks by Category</CardTitle>
              <CardDescription>Distribution across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Priority Distribution</CardTitle>
              <CardDescription>Tasks grouped by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Status Overview</CardTitle>
              <CardDescription>Current task status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
