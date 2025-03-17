
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { PlusCircle, Upload, FileCode, X, AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { scanUploadedFile } from '../services/mockDataService';

interface FileUploadProps {
  onUpload: (file: File, description?: string) => void;
  allowedExtensions?: string[];
  maxSizeMB?: number;
  showDescription?: boolean;
  analyzeScriptContent?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUpload, 
  allowedExtensions = ['.py'],
  maxSizeMB = 5,
  showDescription = true,
  analyzeScriptContent = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = async (selectedFile: File) => {
    // Check file extension
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error(`Please upload a valid file (${allowedExtensions.join(', ')})`);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds the ${maxSizeMB}MB limit`);
      return;
    }
    
    setFile(selectedFile);
    setSecurityIssues([]);
    
    // Security scanning
    setIsScanning(true);
    try {
      const scanResult = await scanUploadedFile(selectedFile);
      if (!scanResult.safe) {
        setSecurityIssues(scanResult.issues);
        toast.error('Security issues detected in the uploaded file');
      } else {
        toast.success('File security scan passed');
      }
    } catch (error) {
      console.error('Error scanning file:', error);
      toast.error('Failed to scan file for security issues');
    } finally {
      setIsScanning(false);
    }
    
    // Read file content if analysis is enabled
    if (analyzeScriptContent) {
      try {
        const content = await readFileAsText(selectedFile);
        setFileContent(content);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Could not read file content');
      }
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleUpload = () => {
    if (!file) return;
    
    // Don't allow upload if security issues were found
    if (securityIssues.length > 0) {
      toast.error('Cannot upload file with security issues');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate progress for demo purposes
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          
          // Proceed with the upload
          onUpload(file, description);
          
          // Reset state after a short delay
          setTimeout(() => {
            setFile(null);
            setFileContent(null);
            setDescription('');
            setUploadProgress(0);
            setIsUploading(false);
            setSecurityIssues([]);
          }, 500);
          
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const handleCancel = () => {
    setFile(null);
    setFileContent(null);
    setDescription('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!file ? (
        <div
          className={`
            relative rounded-lg border-2 border-dashed 
            transition-all duration-300 ease-in-out
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }
            h-56 flex flex-col items-center justify-center cursor-pointer
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            accept={allowedExtensions.join(',')}
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={isDragging ? 'dragging' : 'not-dragging'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-center p-6"
            >
              {isDragging ? (
                <>
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 text-primary"
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.05, 1] 
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    <Upload size={64} />
                  </motion.div>
                  <h3 className="text-lg font-medium text-primary">Drop to upload</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Release to upload your script
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                    <Upload size={64} />
                  </div>
                  <h3 className="text-lg font-medium">Upload Script</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Allowed file types: {allowedExtensions.join(', ')} (max {maxSizeMB}MB)
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex items-center">
            <div className="mr-4 p-3 bg-primary/10 text-primary rounded-lg">
              <FileCode size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB • {new Date().toLocaleString()}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
              disabled={isUploading || isScanning}
            >
              <X size={18} />
            </Button>
          </div>
          
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin">
                  <Shield size={16} />
                </div>
                <span className="text-sm">Scanning file for security issues...</span>
              </div>
              <Progress value={50} className="h-1" />
            </div>
          )}
          
          {securityIssues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Issues Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {securityIssues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {showDescription && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what this script does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isUploading || isScanning}
              />
            </div>
          )}
          
          {fileContent && analyzeScriptContent && (
            <div className="bg-secondary/20 p-3 rounded-md">
              <p className="text-sm font-medium mb-2">Script Analysis</p>
              <p className="text-xs text-muted-foreground">
                This script has {fileContent.split('\n').length} lines and contains 
                {fileContent.includes('def ') 
                  ? ` ${fileContent.match(/def\s+\w+/g)?.length || 0} functions.` 
                  : ' no functions.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AI will analyze this script to detect parameters and generate a UI.
              </p>
            </div>
          )}
          
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
                disabled={isScanning}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleUpload}
                disabled={isScanning || securityIssues.length > 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Script
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FileUpload;
