
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockScripts } from '../lib/mockData';
import { Script } from '../lib/types';
import Layout from '../components/Layout';
import ScriptDetail from '../components/ScriptDetail';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ScriptView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchScript = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch the script from the server
        const foundScript = mockScripts.find(s => s.id === id);
        
        if (foundScript) {
          setScript(foundScript);
        } else {
          toast.error('Script not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching script:', error);
        toast.error('Failed to load script');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScript();
  }, [id, navigate]);

  const handleUpdateScript = (updatedScript: Script) => {
    setScript(updatedScript);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!script) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Script not found</h2>
          <p className="text-muted-foreground mt-2">The script you're looking for doesn't exist.</p>
          <button 
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <ScriptDetail script={script} onUpdate={handleUpdateScript} />
      </motion.div>
    </Layout>
  );
};

export default ScriptView;
