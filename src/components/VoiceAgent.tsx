
import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, PhoneOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/useMobile';

interface Task {
  id: string;
  text: string;
  category: 'personal' | 'professional';
}

interface VoiceAgentProps {
  onTasksCollected: (tasks: Task[], reflection: string) => void;
}

// Production agent ID for the Daily Focus app
const DEFAULT_AGENT_ID = 'agent_01jxtpkc2rfyea485w67v3dhrc';

export const VoiceAgent = ({ onTasksCollected }: VoiceAgentProps) => {
  const [collectedTasks, setCollectedTasks] = useState<Task[]>([]);
  const [reflection, setReflection] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const { isMobile } = useMobile();

  const conversation = useConversation({
    onConnect: () => {
      setIsInitializing(false);
      toast({
        title: isMobile ? "Voice agent ready! 🎙️" : "Voice agent ready! 🎙️",
        description: isMobile ? "Start speaking to add priorities" : "Start speaking to add your daily priorities",
      });
    },
    onDisconnect: () => {
      toast({
        title: "Voice agent disconnected",
        description: "Session ended",
      });
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsInitializing(false);
      toast({
        title: "Voice agent error",
        description: "Unable to connect to voice assistant. Please try again.",
        variant: "destructive"
      });
    },
    clientTools: {
      addTask: (parameters: { text: string; category: 'personal' | 'professional' }) => {
        const newTask: Task = {
          id: Date.now().toString(),
          text: parameters.text,
          category: parameters.category
        };
        
        setCollectedTasks(prev => {
          const updated = [...prev, newTask];
          if (updated.length <= 5) {
            toast({
              title: "Task added! ✅",
              description: `Added: ${parameters.text}`,
            });
          }
          return updated;
        });
        
        return `Task "${parameters.text}" has been added to your ${parameters.category} priorities.`;
      },
      setReflection: (parameters: { reflection: string }) => {
        setReflection(parameters.reflection);
        toast({
          title: "Reflection noted 📝",
          description: "Your daily reflection has been recorded",
        });
        return "Your reflection has been recorded.";
      },
      finalizeTasks: () => {
        if (collectedTasks.length >= 3) {
          onTasksCollected(collectedTasks, reflection);
          return "Your daily priorities have been finalized!";
        } else {
          return `You currently have ${collectedTasks.length} tasks. Please add at least 3 priorities before finalizing.`;
        }
      }
    }
  });

  // Auto-start voice session on component mount
  useEffect(() => {
    const startVoiceSession = async () => {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start the conversation session
        await conversation.startSession({ agentId: DEFAULT_AGENT_ID });
      } catch (error) {
        console.error('Failed to start voice session:', error);
        setIsInitializing(false);
        
        if (error instanceof Error && error.name === 'NotAllowedError') {
          toast({
            title: "Microphone access required",
            description: "Please enable microphone access to use voice features",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Failed to start voice session",
            description: "Unable to connect to voice assistant. Please refresh and try again.",
            variant: "destructive"
          });
        }
      }
    };

    startVoiceSession();

    // Cleanup function to end session when component unmounts
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
  }, []);

  const endVoiceSession = async () => {
    await conversation.endSession();
  };

  return (
    <div className="space-y-6">
      {/* Voice Controls */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Assistant {isMobile && '📱'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInitializing ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to voice assistant...</span>
            </div>
          ) : (
            <>
              {conversation.status === 'connected' && (
                <div className="flex gap-2">
                  <Button onClick={endVoiceSession} variant="destructive" className="flex items-center gap-2">
                    <PhoneOff className="w-4 h-4" />
                    End Session
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  conversation.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className="capitalize">{conversation.status}</span>
                {conversation.isSpeaking && (
                  <span className="text-blue-600 ml-2">🗣️ Speaking...</span>
                )}
              </div>

              {conversation.status === 'connected' && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Say things like:</strong><br/>
                    • "Add a personal task: Go for a morning run"<br/>
                    • "Add professional task: Finish the project proposal"<br/>
                    • "My reflection is: I want to focus on health this week"<br/>
                    • "Finalize my tasks"
                    {isMobile && <br/>}
                    {isMobile && <span className="text-xs">• Speak clearly into your device's microphone</span>}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Collected Tasks Preview */}
      {collectedTasks.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Collected Tasks ({collectedTasks.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collectedTasks.map((task, index) => (
                <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="flex-1">{task.text}</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Preview */}
      {reflection && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 italic">"{reflection}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
