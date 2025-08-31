import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DocumentArrowUpIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { FileText, Shield, Brain, Clock } from 'lucide-react';

interface SuggestedPromptsProps {
  onPromptSelect: (prompt: string) => void;
  disabled: boolean;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptSelect, disabled }) => {
  const prompts = [
    {
      icon: FileText,
      title: "Upload a PDF document for analysis",
      description: "Get started by uploading your document",
      prompt: "What can you tell me about this document?"
    },
    {
      icon: Shield,
      title: "Ask about document privacy and security",
      description: "Learn about our privacy-first approach",
      prompt: "How is my document data protected and processed?"
    },
    {
      icon: Brain,
      title: "How does AI understand my documents?",
      description: "Understand our AI processing capabilities",
      prompt: "Explain how you analyze and understand document content"
    },
    {
      icon: Clock,
      title: "Explain the ephemeral processing system",
      description: "Learn about temporary data handling",
      prompt: "How does the ephemeral memory system work?"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground">
          Use one of the most common prompts below or use your own to begin
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="suggestion"
            size="suggestion"
            onClick={() => onPromptSelect(prompt.prompt)}
            disabled={disabled}
            className="justify-start text-left h-auto"
          >
            <div className="flex items-start space-x-3 w-full">
              <div className="p-2 bg-purple-100 rounded-lg">
                <prompt.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-600 mb-1">{prompt.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prompt.description}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;