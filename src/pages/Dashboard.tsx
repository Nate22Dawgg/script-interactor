
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ScriptList from '../components/ScriptList';
import FileUpload from '../components/FileUpload';
import { Script } from '../lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getScripts, uploadScript } from '../services/scriptService';

const Dashboard = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      setLoading(true);
      try {
        const fetchedScripts = await getScripts();
        setScripts(fetchedScripts);
      } catch (error) {
        console.error('Error fetching scripts:', error);
        toast.error('Failed to load scripts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScripts();
  }, []);

  const handleUpload = async (file: File) => {
    try {
      const newScript = await uploadScript(file);
      setScripts([newScript, ...scripts]);
      setShowUpload(false);
      toast.success(`Script "${file.name}" added successfully`);
    } catch (error) {
      console.error('Error uploading script:', error);
      toast.error('Failed to upload script');
    }
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
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <ScriptList scripts={scripts} />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
