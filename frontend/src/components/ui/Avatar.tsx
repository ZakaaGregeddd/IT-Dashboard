import React from 'react';
import { cn } from './Card'; // reuse the cn utility

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({ fallback, className, ...props }) => {
  return (
    <div 
      className={cn(
        "w-8 h-8 rounded bg-primary-900 text-white flex items-center justify-center font-bold text-sm",
        className
      )}
      {...props}
    >
      {fallback}
    </div>
  );
};
