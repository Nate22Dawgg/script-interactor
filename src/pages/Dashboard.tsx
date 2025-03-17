
import { useState } from 'react';
import Layout from '../components/Layout';
import ScriptList from '../components/ScriptList';
import FileUpload from '../components/FileUpload';
import { mockScripts } from '../lib/mockData';
import { Script } from '../lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [scripts, setScripts] = useState<Script[]>(mockScripts);
  const [showUpload, setShowUpload] = useState(false);

  const handleUpload = (file: File) => {
    // In a real app, we would process the file and upload it to the server
    // For now, we'll just create a new mock script
    const newScript: Script = {
      id: (scripts.length + 1).toString(),
      name: file.name.replace('.py', ''),
      description: 'Uploaded script',
      code: '# Python code will be loaded here\nprint("Hello, world!")',
      language: 'python',
      dateCreated: new Date().toISOString(),
      status: 'idle'
    };
    
    setScripts([newScript, ...scripts]);
    setShowUpload(false);
    toast.success(`Script "${file.name}" added successfully`);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            Script Dashboard
          </motion.h1>
          
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Upload Script
              </>
            )}
          </motion.button>
        </div>
        
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <FileUpload onUpload={handleUpload} />
          </motion.div>
        )}
        
        <ScriptList scripts={scripts} />
      </div>
    </Layout>
  );
};

export default Dashboard;
