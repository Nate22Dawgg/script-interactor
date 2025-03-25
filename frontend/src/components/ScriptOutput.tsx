
import { useState, useEffect, useRef } from 'react';
import { LogEntry, Visualization } from '../lib/types';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subscribeToScript } from '../services/scriptService';

interface ScriptOutputProps {
  scriptId: string;
  output?: string;
  logs?: LogEntry[];
  visualizations?: Visualization[];
}

const ScriptOutput: React.FC<ScriptOutputProps> = ({ 
  scriptId, 
  output = '', 
  logs = [], 
  visualizations = [] 
}) => {
  const [activeTab, setActiveTab] = useState<string>('console');
  const [liveOutput, setLiveOutput] = useState<string>(output);
  const [liveLogs, setLiveLogs] = useState<LogEntry[]>(logs);
  const outputRef = useRef<HTMLPreElement>(null);
  
  // Auto-scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [liveOutput, liveLogs]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToScript(scriptId, (data) => {
      if (data.type === 'log') {
        const newLog: LogEntry = {
          timestamp: new Date().toISOString(),
          level: data.level || 'info',
          message: data.message
        };
        
        setLiveLogs(prev => [...prev, newLog]);
      }
      
      if (data.type === 'output') {
        setLiveOutput(prev => prev + data.content);
      }
      
      if (data.type === 'visualization') {
        // Handle visualizations - would be implemented in a real app
        console.log('Received visualization data:', data);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [scriptId]);
  
  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-300';
    }
  };
  
  return (
    <div className="w-full h-full min-h-[400px] rounded-lg border border-border overflow-hidden">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-secondary/20">
          <TabsList className="h-11 bg-transparent">
            <TabsTrigger value="console" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Console
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Logs
            </TabsTrigger>
            {visualizations.length > 0 && (
              <TabsTrigger value="visualizations" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Visualizations
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <div className="p-0 h-full">
          <TabsContent value="console" className="mt-0 h-full">
            <pre
              ref={outputRef}
              className="font-mono text-sm p-4 bg-secondary/30 h-[400px] overflow-auto"
            >
              <code>{liveOutput || 'No output yet. Run the script to see results.'}</code>
            </pre>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-0 h-full">
            <div className="font-mono text-sm bg-secondary/30 h-[400px] overflow-auto">
              {liveLogs.length > 0 ? (
                <div className="p-4 space-y-2">
                  {liveLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${getLogColor(log.level)}`}
                    >
                      <span className="text-xs opacity-70">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="ml-2">
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-2">{log.message}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-muted-foreground">
                  No logs yet. Run the script to see logs.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="visualizations" className="mt-0 h-full">
            <div className="p-4 bg-secondary/30 h-[400px] overflow-auto">
              {visualizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visualizations.map((viz) => (
                    <motion.div
                      key={viz.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border border-border rounded-lg p-4 bg-card"
                    >
                      <h3 className="text-sm font-medium mb-2">
                        {viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}
                      </h3>
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        {viz.type === 'chart' && (
                          <div>Chart visualization will render here</div>
                        )}
                        {viz.type === 'graph' && (
                          <div>Graph visualization will render here</div>
                        )}
                        {viz.type === 'table' && (
                          <div>Table visualization will render here</div>
                        )}
                        {viz.type === 'image' && (
                          <div>Image visualization will render here</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No visualizations available. Add visualization code to your script.
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ScriptOutput;
