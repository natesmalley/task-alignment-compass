
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Briefcase, MessageSquare } from 'lucide-react';

interface HistoryTask {
  id: string;
  text: string;
  category: 'personal' | 'professional';
  priority: number;
}

interface DailyEntry {
  date: string;
  tasks: HistoryTask[];
  reflection: string;
  timestamp: string;
}

export const TaskHistory = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('dailyEntries') || '[]');
    // Sort by date, most recent first
    const sortedEntries = savedEntries.sort((a: DailyEntry, b: DailyEntry) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setEntries(sortedEntries);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No history yet</h3>
          <p className="text-gray-600">
            Complete your first daily prioritization to start building your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Journey</h2>
        <p className="text-gray-600">
          {entries.length} day{entries.length !== 1 ? 's' : ''} of focused prioritization
        </p>
      </div>

      {entries.map((entry, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {getDaysAgo(entry.date)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tasks */}
            <div className="space-y-2">
              {entry.tasks.map((task, taskIndex) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {taskIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium text-sm">{task.text}</p>
                  </div>
                  <Badge 
                    variant={task.category === 'personal' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {task.category === 'personal' ? (
                      <><User className="w-3 h-3 mr-1" /> P</>
                    ) : (
                      <><Briefcase className="w-3 h-3 mr-1" /> W</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Reflection */}
            {entry.reflection && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700 italic">"{entry.reflection}"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Insights */}
      {entries.length >= 3 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-bold text-gray-900 mb-2">Building Momentum!</h3>
            <p className="text-gray-600 text-sm">
              You've completed {entries.length} days of intentional prioritization. 
              Notice any patterns in your choices?
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
