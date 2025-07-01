import { useState } from 'react';
import { VoiceAgent } from './VoiceAgent';
import { DailyTaskEntry } from './DailyTaskEntry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Keyboard, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveDailyEntry, updateLastCompleted } from '@/utils/storage';

interface Task {
  id: string;
  text: string;
  category: 'personal' | 'professional';
  priority: number;
}

interface VoiceTaskEntryProps {
  onComplete: () => void;
}

export const VoiceTaskEntry = ({ onComplete }: VoiceTaskEntryProps) => {
  const [mode, setMode] = useState<'voice' | 'manual'>('voice');
  const { toast } = useToast();

  const handleVoiceTasksCollected = (
    voiceTasks: Array<{ id: string; text: string; category: 'personal' | 'professional' }>,
    reflection: string
  ) => {
    try {
      const today = new Date().toDateString();

      // Convert voice tasks to the expected format
      const tasks: Task[] = voiceTasks.map((task, index) => ({
        ...task,
        priority: index + 1
      }));

      // --- DEBUG --------------------------------------------------------------
      console.group('[VoiceTaskEntry] handleVoiceTasksCollected');
      console.log('raw voiceTasks', voiceTasks);
      console.log('mapped tasks', tasks);
      // -----------------------------------------------------------------------

      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error('No tasks to persist');
      }

      if (tasks.length < 3) {
        toast({
          title: "Need more tasks",
          description: "Please add at least 3 priorities before finalizing",
          variant: "destructive"
        });
        return;
      }

      const dailyEntry = {
        date: today,
        tasks,
        reflection,
        timestamp: new Date().toISOString()
      };

      saveDailyEntry(dailyEntry);
      updateLastCompleted(today);

      toast({
        title: 'Voice priorities set! 🎯',
        description: 'Your daily focus has been captured through voice!'
      });

      console.groupEnd();
      onComplete();
    } catch (err) {
      console.groupEnd();
      console.error('[VoiceTaskEntry] Persist failed', err);
      toast({
        title: 'Could not save your tasks',
        description: (err as Error).message ?? 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Choose Your Input Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={mode === 'voice' ? 'default' : 'outline'}
              onClick={() => setMode('voice')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Mic className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Voice Assistant</div>
                <div className="text-xs opacity-75">Speak your priorities</div>
              </div>
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Keyboard className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Manual Entry</div>
                <div className="text-xs opacity-75">Type your priorities</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on mode */}
      {mode === 'voice' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tell me your priorities for today
            </h2>
            <p className="text-gray-600">
              Use your voice to easily capture 3-5 tasks that matter most
            </p>
          </div>
          <VoiceAgent onTasksCollected={handleVoiceTasksCollected} />
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What are your top priorities today?
            </h2>
            <p className="text-gray-600">
              Choose 3-5 tasks that align with your personal and professional goals
            </p>
          </div>
          <DailyTaskEntry onComplete={onComplete} />
        </>
      )}
    </div>
  );
};
