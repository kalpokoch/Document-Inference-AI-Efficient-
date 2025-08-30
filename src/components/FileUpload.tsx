import React, { useCallback, useState } from 'react';
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  isDocumentUploaded: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isUploading,
  uploadProgress,
  isDocumentUploaded
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const supportedFormats = [
    { type: 'PDF', icon: DocumentTextIcon, color: 'text-red-500' },
    { type: 'PNG', icon: PhotoIcon, color: 'text-blue-500' },
    { type: 'JPG', icon: PhotoIcon, color: 'text-green-500' },
    { type: 'TXT', icon: DocumentTextIcon, color: 'text-gray-500' },
    { type: 'MD', icon: DocumentTextIcon, color: 'text-purple-500' },
  ];

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain', 'text/markdown'];
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return false;
    }

    if (!supportedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a PDF, PNG, JPG, TXT, or MD file",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      toast({
        title: "Multiple files detected",
        description: "Please upload one file at a time",
        variant: "destructive"
      });
      return;
    }

    const file = files[0];
    if (validateFile(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileUpload(file);
    }
  };

  if (isDocumentUploaded) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
        <div className="flex items-center justify-center space-x-3 text-success">
          <CheckCircleIcon className="h-6 w-6" />
          <span className="font-medium">Document processed successfully!</span>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          Your document has been indexed and is ready for questions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-border hover:border-purple-500 hover:bg-purple-50/50'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-foreground font-medium">Processing document...</p>
              <p className="text-muted-foreground text-sm">Creating embeddings and indexing content</p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ArrowUpTrayIcon className="h-12 w-12 text-purple-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Upload your document</h3>
              <p className="text-muted-foreground">Drag and drop or click to select</p>
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose File
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="font-medium text-foreground mb-3">Supported formats</h4>
        <div className="flex flex-wrap gap-3">
          {supportedFormats.map((format) => (
            <div key={format.type} className="flex items-center space-x-2">
              <format.icon className={`h-4 w-4 ${format.color}`} />
              <span className="text-sm text-muted-foreground">{format.type}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
      </div>
    </div>
  );
};

export default FileUpload;