import type { ReactNode } from "react";
import Header from "./Header/Header";

interface BaseLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function BaseLayout({ children, showHeader = true }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-100 via-energy-100/50 to-ocean-200/30 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-60" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231890ff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Additional gradient overlay for more color */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-energy-200/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-ocean-200/20 to-transparent"></div>
      </div>
      
      {showHeader && (
        <div className="relative z-10">
          <Header />
        </div>
      )}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

