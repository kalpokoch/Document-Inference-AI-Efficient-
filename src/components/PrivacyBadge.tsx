import React from 'react';
import { ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/solid';

interface PrivacyBadgeProps {
  sessionActive: boolean;
}

const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ sessionActive }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
      <div className="flex items-center space-x-2 bg-success/10 text-success px-3 py-2 rounded-full">
        <ShieldCheckIcon className="h-4 w-4" />
        <span className="font-medium">Zero Persistence</span>
      </div>
      
      <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-full">
        <ClockIcon className="h-4 w-4" />
        <span className="font-medium">Complete Privacy</span>
      </div>
      
      {sessionActive && (
        <div className="flex items-center space-x-2 bg-warning/10 text-warning-foreground px-3 py-2 rounded-full">
          <div className="h-2 w-2 bg-warning rounded-full animate-pulse" />
          <span className="font-medium">Ephemeral Session Active</span>
        </div>
      )}
    </div>
  );
};

export default PrivacyBadge;