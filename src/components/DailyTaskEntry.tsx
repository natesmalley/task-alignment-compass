import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Briefcase, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/models/task';
import { safeLoadDailyEntries, saveDailyEntry, updateLastCompleted } from '@/utils/storage';

interface DailyTaskEntryProps {
  onComplete: () => void;
}

export const DailyTaskEntry = ({ onComplete }: DailyTaskEntryProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'personal' | 'professional'>('personal');
  const [reflection, setReflection] = useState('');
  const { toast } = useToast();

  // Identify the current day (used as a unique key in storage)
  const todayKey = new Date().toDateString();

  /** Hydrate tasks/reflection if the voice flow already saved today’s entry */
  useEffect(() => {
    const existing = safeLoadDailyEntries().find(e => e.date === todayKey);
    if (existing) {
      setTasks(existing.tasks);
      setReflection(existing.reflection ?? '');
    }
  }, [todayKey]);

  const addTask = () => {
    if (!newTask.trim()) return;
    
    if (tasks.length >= 5) {
      toast({
        title: "Task limit reached",
        description: "Focus on 3-5 key priorities for better results!",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      category: selectedCategory,
      priority: tasks.length + 1,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask('');
    
    toast({
      title: "Task added!",
      description: `Added to ${selectedCategory} priorities`,
    });
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSubmit = () => {
    if (tasks.length < 3) {
      toast({
        title: "Add more tasks",
        description: "We recommend at least 3 priorities for the day",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toDateString();
    const dailyEntry = {
      date: today,
      tasks,
      reflection,
      timestamp: new Date().toISOString(),
    };
    saveDailyEntry(dailyEntry);
    updateLastCompleted(today);

    toast({
      title: "Priorities set! 🎯",
      description: "Your daily focus is locked in. Let's make it happen!",
    });

    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Task Input */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Add Your Priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-3">
            <Button
              variant={selectedCategory === 'personal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('personal')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Personal
            </Button>
            <Button
              variant={selectedCategory === 'professional' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('professional')}
              className="flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Professional
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="What needs your focus today?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {tasks.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Today's Priorities ({tasks.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{task.text}</p>
                  <Badge 
                    variant={task.category === 'personal' ? 'secondary' : 'outline'}
                    className="mt-1"
                  >
                    {task.category === 'personal' ? (
                      <><User className="w-3 h-3 mr-1" /> Personal</>
                    ) : (
                      <><Briefcase className="w-3 h-3 mr-1" /> Professional</>
                    )}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(task.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reflection */}
      {tasks.length >= 3 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Daily Reflection</CardTitle>
            <p className="text-sm text-gray-600">
              How do these priorities align with your bigger goals?
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Optional: Reflect on how these tasks connect to your personal and professional growth..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {tasks.length > 0 && (
        <Button 
          onClick={handleSubmit}
          className="w-full py-6 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          disabled={tasks.length < 3}
        >
          {tasks.length < 3 
            ? `Add ${3 - tasks.length} more task${3 - tasks.length > 1 ? 's' : ''} to continue`
            : 'Lock in Today\'s Focus 🎯'
          }
        </Button>
      )}
    </div>
  );
};
