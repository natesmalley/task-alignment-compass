
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Award, Flame } from 'lucide-react';

interface ProgressDashboardProps {
  streak: number;
}

export const ProgressDashboard = ({ streak }: ProgressDashboardProps) => {
  // Mock data for demonstration
  const weeklyProgress = 5; // out of 7 days
  const monthlyGoal = 25; // days in month
  const completedThisMonth = 18;
  const personalTasks = 45;
  const professionalTasks = 38;

  const achievements = [
    { title: '3-Day Streak', earned: true, icon: '🔥' },
    { title: 'Weekly Warrior', earned: true, icon: '⚡' },
    { title: 'Consistency King', earned: false, icon: '👑' },
    { title: 'Monthly Master', earned: false, icon: '🏆' }
  ];

  return (
    <div className="space-y-6">
      {/* Current Streak */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{streak} Days</h3>
              <p className="text-gray-600">Current streak</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly & Monthly Progress */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">{weeklyProgress}/7</div>
            <Progress value={(weeklyProgress / 7) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">{completedThisMonth}/{monthlyGoal}</div>
            <Progress value={(completedThisMonth / monthlyGoal) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Task Categories */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Personal</span>
            </div>
            <Badge variant="secondary">{personalTasks} tasks</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Professional</span>
            </div>
            <Badge variant="outline">{professionalTasks} tasks</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-center ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className={`text-xs font-medium ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🌟</div>
          <h3 className="font-bold text-gray-900 mb-2">Keep it up!</h3>
          <p className="text-gray-600 text-sm">
            You're building great habits. Consistency is the key to lasting change.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
