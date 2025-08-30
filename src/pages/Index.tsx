import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import SuggestedPrompts from '@/components/SuggestedPrompts';
import PrivacyBadge from '@/components/PrivacyBadge';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  context?: string;
  timestamp: Date;
}

const API_BASE = 'https://kalpokoch-openquery.hf.space';

const Index = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userName] = useState('User'); // Could be dynamic based on auth
  
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        setSessionId(data.session_id);
        setIsDocumentUploaded(true);
        setIsUploading(false);
        
        toast({
          title: "Document processed successfully!",
          description: `${data.chunks_created || 'Multiple'} chunks created and indexed`,
        });

        // Add welcome message from AI
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Great! I've successfully processed your document "${data.filename || file.name}". ${data.chunks_created ? `Created ${data.chunks_created} chunks for analysis.` : ''} What would you like to know about it?`,
          timestamp: new Date()
        };
        setChatMessages([welcomeMessage]);
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      if (errorMessage.includes('503')) {
        toast({
          title: "AI models temporarily unavailable",
          description: "Please try again in a few moments",
          variant: "destructive"
        });
      } else if (errorMessage.includes('400')) {
        toast({
          title: "File processing failed",
          description: "File format not supported or no text found",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  const handleNewDocument = () => {
    // Reset all states to start fresh
    setSessionId(null);
    setIsDocumentUploaded(false);
    setChatMessages([]);
    setUploadProgress(0);
  };

  const sendMessage = async (question: string) => {
    if (!sessionId) {
      toast({
        title: "No active session",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/query/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        context: data.context,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query failed';
      
      if (errorMessage.includes('404')) {
        toast({
          title: "Session expired",
          description: "Please upload your document again",
          variant: "destructive"
        });
        setSessionId(null);
        setIsDocumentUploaded(false);
      } else {
        toast({
          title: "Query failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = useCallback((prompt: string) => {
    if (isDocumentUploaded && sessionId) {
      sendMessage(prompt);
    }
  }, [isDocumentUploaded, sessionId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hi there, <span className="text-purple-600">{userName}</span>
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground mb-6">
            What would you like to know?
          </h2>
          <p className="text-muted-foreground mb-8">
            Upload a document and ask questions with complete privacy
          </p>
          <PrivacyBadge sessionActive={!!sessionId} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {!isDocumentUploaded ? (
          /* Upload View - Center everything when no document */
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Upload Document
              </h3>
              <FileUpload
                onFileUpload={uploadFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                isDocumentUploaded={isDocumentUploaded}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Get Started
              </h3>
              <SuggestedPrompts
                onPromptSelect={handlePromptSelect}
                disabled={!isDocumentUploaded}
              />
            </div>
          </div>
        ) : (
          /* Chat View - Full width when document is uploaded */
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
              AI Assistant
            </h3>
            <ChatInterface
              messages={chatMessages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              disabled={!isDocumentUploaded}
              onNewDocument={handleNewDocument}
            />
          </div>
        )}

        {/* Privacy Information */}
        <div className="mt-16 bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-4">Privacy & Security</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">Ephemeral Processing:</strong><br />
                Your data exists only during this session
              </div>
              <div>
                <strong className="text-foreground">In-Memory Only:</strong><br />
                All processing happens in temporary memory
              </div>
              <div>
                <strong className="text-foreground">Auto-Deletion:</strong><br />
                Documents are permanently deleted when you close the app
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
