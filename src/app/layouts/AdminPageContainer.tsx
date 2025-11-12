import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export default function AdminPageContainer({ 
  children, 
  className,
  title,
  description 
}: AdminPageContainerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      {(title || description) && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 shadow-lg">
          {title && (
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-400 to-energy-400 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-dark-300 font-medium">{description}</p>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-dark-700/50 shadow-lg p-6">
        {children}
      </div>
    </div>
  );
}




