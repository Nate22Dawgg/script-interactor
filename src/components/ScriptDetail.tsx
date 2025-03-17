
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Script } from '../lib/types';
import { toast } from 'sonner';

interface ScriptDetailProps {
  script: Script;
  onUpdate?: (updatedScript: Script) => void;
}

const ScriptDetail: React.FC<ScriptDetailProps> = ({ script, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'output' | 'info'>('code');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(script.code);
  
  const getStatusColor = (status: Script['status']) => {
    switch (status) {
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const handleRunScript = () => {
    if (script.status === 'running') {
      toast.info('Script is already running');
      return;
    }
    
    toast.success('Script execution started');
    
    // Simulate script running
    if (onUpdate) {
      onUpdate({
        ...script,
        status: 'running'
      });
    }
    
    // Simulate script completion after delay
    setTimeout(() => {
      if (onUpdate) {
        onUpdate({
          ...script,
          status: 'completed',
          lastRun: new Date().toISOString(),
          output: 'Script executed successfully!\n\nExample output:\n--------------\n' + 
                 'Processed 237 items\nComputed results: [1.23, 4.56, 7.89]\nExecution time: 1.45s'
        });
      }
      toast.success('Script execution completed');
    }, 5000);
  };

  const handleSaveCode = () => {
    if (onUpdate) {
      onUpdate({
        ...script,
        code: editedCode
      });
    }
    setIsEditing(false);
    toast.success('Script saved successfully');
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
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(!isEditing)}
            disabled={activeTab !== 'code'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            {isEditing ? 'Cancel' : 'Edit'}
          </motion.button>
          
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
          ) : (
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                script.status === 'running' 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunScript}
              disabled={script.status === 'running'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              {script.status === 'running' ? 'Running...' : 'Run Script'}
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {(['code', 'output', 'info'] as const).map((tab) => (
            <motion.button
              key={tab}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-200`}
              variants={tabVariants}
              animate={activeTab === tab ? 'active' : 'inactive'}
              onClick={() => setActiveTab(tab)}
            >
              <span className="capitalize">{tab}</span>
            </motion.button>
          ))}
        </div>
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
        
        {activeTab === 'output' && (
          <div className="relative">
            <pre className="font-mono text-sm p-4 rounded-lg border border-border bg-secondary/30 h-[500px] overflow-auto">
              <code>
                {script.output || 'No output yet. Run the script to see results.'}
              </code>
            </pre>
          </div>
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
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Run History</h3>
              <div className="text-sm text-muted-foreground">
                Run history will be displayed here in a future update.
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Permissions</h3>
              <div className="text-sm text-muted-foreground">
                This script has default permissions with no external API access.
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ScriptDetail;
