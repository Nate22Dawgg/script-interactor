
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState, ErrorBoundary } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ScriptView from "./pages/ScriptView";
import NotFound from "./pages/NotFound";
import { initializeWebSocket } from "./services/websocketService";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";

// Global error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Application Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Something went wrong:</p>
          <pre className="mt-2 bg-secondary/20 p-2 rounded text-xs overflow-auto">
            {error.message}
          </pre>
          <div className="mt-4">
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        // We could show a global error toast here if needed
      }
    }
  }
});

const App = () => {
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection when app loads
    initializeWebSocket();
    
    // Set up global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent default to avoid the error being logged to console
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Check WebSocket connection status periodically
    const wsCheckInterval = setInterval(() => {
      // This would ideally come from a state management store
      const status = window.wsStatus || 'closed';
      setWsConnected(status === 'open');
    }, 5000);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(wsCheckInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/script/:id" element={<ScriptView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
