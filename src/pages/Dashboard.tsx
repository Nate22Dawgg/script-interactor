
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ScriptList from '../components/ScriptList';
import FileUpload from '../components/FileUpload';
import { Script } from '../lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getScripts, uploadScript } from '../services/scriptService';
import { Button } from '@/components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';

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

  const handleUpload = async (file: File, description?: string) => {
    try {
      const newScript = await uploadScript(file, description);
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
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant={showUpload ? "secondary" : "default"}
              className="flex items-center gap-2"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? (
                <>
                  <XIcon className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Upload Script
                </>
              )}
            </Button>
          </motion.div>
        </div>
        
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <FileUpload 
              onUpload={handleUpload}
              allowedExtensions={['.py']}
              maxSizeMB={10}
              showDescription={true}
              analyzeScriptContent={true}
            />
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
