
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Script, UIComponent } from '../lib/types';
import { toast } from 'sonner';
import { executeScript, updateScript, updateScriptUI } from '../services/scriptService';
import ScriptOutput from './ScriptOutput';
import ScriptUI from './ScriptUI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScriptDetailProps {
  script: Script;
  onUpdate?: (updatedScript: Script) => void;
}

const ScriptDetail: React.FC<ScriptDetailProps> = ({ script, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'output' | 'ui' | 'info'>('code');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(script.code);
  const [isRunning, setIsRunning] = useState(script.status === 'running');
  const [isEditingUI, setIsEditingUI] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [executionStats, setExecutionStats] = useState({
    executionTime: script.executionTime || 0,
    memory: script.memory || 0,
    cpuUsage: script.cpuUsage || 0
  });
  
  useEffect(() => {
    // Update local state when script prop changes
    setEditedCode(script.code);
    setIsRunning(script.status === 'running');
    setExecutionStats({
      executionTime: script.executionTime || 0,
      memory: script.memory || 0,
      cpuUsage: script.cpuUsage || 0
    });
  }, [script]);
  
  const getStatusColor = (status: Script['status']) => {
    switch (status) {
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const handleRunScript = async () => {
    if (isRunning) {
      toast.info('Script is already running');
      return;
    }
    
    setIsRunning(true);
    toast.success('Script execution started');
    
    // Update local state
    if (onUpdate) {
      onUpdate({
        ...script,
        status: 'running' as const
      });
    }
    
    try {
      // Execute the script
      await executeScript({ 
        scriptId: script.id,
        parameters: parameters
      });
      
      // The real-time updates will come through WebSocket
      // For now, we'll simulate completion after a delay
      setTimeout(() => {
        const completedScript: Script = {
          ...script,
          status: 'completed',
          lastRun: new Date().toISOString(),
          output: 'Script executed successfully!\n\nExample output:\n--------------\n' + 
                 'Processed 237 items\nComputed results: [1.23, 4.56, 7.89]\nExecution time: 1.45s',
          executionTime: 1.45,
          memory: 32.4,
          cpuUsage: 12.5,
          logs: [
            { timestamp: new Date().toISOString(), level: 'info', message: 'Script started' },
            { timestamp: new Date(Date.now() + 500).toISOString(), level: 'info', message: 'Processing data...' },
            { timestamp: new Date(Date.now() + 1000).toISOString(), level: 'info', message: 'Processed 237 items' },
            { timestamp: new Date(Date.now() + 1300).toISOString(), level: 'warning', message: 'Performance warning: High memory usage' },
            { timestamp: new Date(Date.now() + 1450).toISOString(), level: 'info', message: 'Script completed successfully' }
          ]
        };
        
        if (onUpdate) {
          onUpdate(completedScript);
        }
        
        setIsRunning(false);
        setExecutionStats({
          executionTime: 1.45,
          memory: 32.4,
          cpuUsage: 12.5
        });
        
        toast.success('Script execution completed');
      }, 5000);
    } catch (error) {
      console.error('Error running script:', error);
      
      if (onUpdate) {
        onUpdate({
          ...script,
          status: 'failed',
          lastRun: new Date().toISOString(),
          output: 'Script execution failed. See logs for details.'
        });
      }
      
      setIsRunning(false);
      toast.error('Script execution failed');
    }
  };

  const handleSaveCode = async () => {
    try {
      const updatedScript = {
        ...script,
        code: editedCode
      };
      
      const result = await updateScript(updatedScript);
      
      if (onUpdate) {
        onUpdate(result);
      }
      
      setIsEditing(false);
      toast.success('Script saved successfully');
    } catch (error) {
      console.error('Error saving script:', error);
      toast.error('Failed to save script');
    }
  };
  
  const handleParametersChange = (params: Record<string, any>) => {
    setParameters(params);
  };
  
  const handleUpdateUI = async (components: UIComponent[]) => {
    try {
      const updatedScript = await updateScriptUI(script.id, components);
      
      if (onUpdate) {
        onUpdate(updatedScript);
      }
      
      setIsEditingUI(false);
      toast.success('UI updated successfully');
    } catch (error) {
      console.error('Error updating UI:', error);
      toast.error('Failed to update UI');
    }
  };

  const tabVariants = {
    active: {
      color: 'hsl(var(--primary))',
      borderColor: 'hsl(var(--primary))',
    },
    inactive: {
      color: 'hsl(var(--muted-foreground))',
      borderColor: 'transparent',
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(script.status)}`}></div>
            <h1 className="text-2xl font-semibold">{script.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{script.description}</p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'code' && (
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isRunning}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              {isEditing ? 'Cancel' : 'Edit'}
            </motion.button>
          )}
          
          {isEditing ? (
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveCode}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
              </svg>
              Save
            </motion.button>
          ) : activeTab !== 'ui' && (
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                isRunning 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunScript}
              disabled={isRunning}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              {isRunning ? 'Running...' : 'Run Script'}
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="border-b border-border">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="ui">UI</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        {activeTab === 'code' && (
          <div className="relative">
            {isEditing ? (
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full h-[500px] font-mono text-sm p-4 rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            ) : (
              <pre className="font-mono text-sm p-4 rounded-lg border border-border bg-secondary/30 h-[500px] overflow-auto">
                <code>
                  {script.code}
                </code>
              </pre>
            )}
          </div>
        )}
        
        {activeTab === 'ui' && (
          <ScriptUI 
            components={script.generatedUI}
            parameters={script.parameters}
            onParametersChange={handleParametersChange}
            onExecute={handleRunScript}
            onEdit={handleUpdateUI}
            isEditing={isEditingUI}
          />
        )}
        
        {activeTab === 'output' && (
          <ScriptOutput 
            scriptId={script.id} 
            output={script.output}
            logs={script.logs}
            visualizations={script.visualizations}
          />
        )}
        
        {activeTab === 'info' && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Script Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Language</span>
                    <p className="capitalize">{script.language}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <p className="capitalize">{script.status}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Created</span>
                    <p>{new Date(script.dateCreated).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Last Run</span>
                    <p>{script.lastRun ? new Date(script.lastRun).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {script.lastRun && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Execution Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Execution Time</p>
                    <p className="text-2xl font-semibold">{executionStats.executionTime.toFixed(2)}s</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Memory Usage</p>
                    <p className="text-2xl font-semibold">{executionStats.memory.toFixed(1)} MB</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">CPU Usage</p>
                    <p className="text-2xl font-semibold">{executionStats.cpuUsage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Execution Environment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Memory Limit</span>
                  <p>128 MB</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Timeout</span>
                  <p>60 seconds</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Sandbox</span>
                  <p>Secure Python Container</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Allowed Modules</h3>
              <div className="flex flex-wrap gap-2">
                {['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'scipy', 'tensorflow', 'requests'].map((module) => (
                  <div key={module} className="px-2 py-1 bg-secondary/30 rounded text-xs">
                    {module}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ScriptDetail;
