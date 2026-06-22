import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for merging tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white p-1.5 sm:p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-[10px] font-semibold text-slate-800 mb-0.5 leading-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";
