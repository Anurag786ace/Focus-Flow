import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  Search,
  ChevronLeft,
  Tag,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/types/task';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onNewTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const navItems = [
  { id: 'board', label: 'Board', icon: LayoutDashboard },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const Sidebar = ({
  isCollapsed,
  onToggle,
  activeView,
  onViewChange,
  onNewTask,
  searchQuery,
  onSearchChange,
}: SidebarProps) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar flex flex-col"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <CheckSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-foreground">TaskFlow</span>
          )}
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Search & New Task */}
      <div className="p-3 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
              />
            </div>
            <Button
              onClick={onNewTask}
              className="w-full gradient-primary shadow-glow hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </>
        ) : (
          <Button
            onClick={onNewTask}
            size="icon"
            className="w-full gradient-primary shadow-glow hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="mb-4">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Views
            </p>
          )}
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full justify-start gap-3 h-10",
                activeView === item.id && "bg-primary/10 text-primary",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        {!isCollapsed && (
          <div>
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categories
            </p>
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground"
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span>{category}</span>
              </Button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </div>
    </motion.aside>
  );
};
