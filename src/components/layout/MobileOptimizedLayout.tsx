
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  sidebar,
  header,
  className
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    return (
      <div className={cn("min-h-screen bg-gray-50", className)}>
        {/* Mobile Header */}
        {header && (
          <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              {sidebar && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Navigation</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {sidebar}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <div className="flex-1 px-4">
                {header}
              </div>
            </div>
          </header>
        )}

        {/* Mobile Content */}
        <main className="px-4 py-4">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {sidebar && (
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="h-full overflow-y-auto">
            {sidebar}
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        {header && (
          <header className="bg-white border-b shadow-sm">
            <div className="px-6 py-4">
              {header}
            </div>
          </header>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;
