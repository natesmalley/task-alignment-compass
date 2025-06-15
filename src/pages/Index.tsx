import { useState, useEffect } from 'react';
import { VoiceTaskEntry } from '@/components/VoiceTaskEntry';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { TaskHistory } from '@/components/TaskHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

const Index = () => {
  const [completedToday, setCompletedToday] = useState(false);
  const [streak, setStreak] = useState(3); // Mock data for demo
  const { isMobile, isIOS } = useMobile();

  useEffect(() => {
    // Check if user has already completed today's prioritization
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('lastCompleted');
    setCompletedToday(lastCompleted === today);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${isMobile ? 'pb-safe' : ''}`}>
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10 ${isIOS ? 'pt-safe' : ''}`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Daily Focus</h1>
                <p className="text-sm text-gray-600">Build better habits, one day at a time</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-md mx-auto px-4 py-6 ${isMobile ? 'px-safe' : ''}`}>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {!completedToday ? (
              <VoiceTaskEntry onComplete={() => setCompletedToday(true)} />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Great job!</h2>
                <p className="text-gray-600 mb-4">
                  You've set your priorities for today. Check back tomorrow for your next reflection.
                </p>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Tip:</strong> Review your tasks throughout the day and celebrate each completion!
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <ProgressDashboard streak={streak} />
          </TabsContent>

          <TabsContent value="history">
            <TaskHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
