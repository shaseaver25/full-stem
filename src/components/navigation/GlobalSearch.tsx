import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, BookOpen, Users, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getResultIcon = (type: string) => {
  switch (type) {
    case 'class':
      return <BookOpen className="h-4 w-4" />;
    case 'lesson':
      return <FileText className="h-4 w-4" />;
    case 'content':
      return <FileText className="h-4 w-4" />;
    case 'student':
      return <GraduationCap className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
};

const getResultLabel = (type: string) => {
  switch (type) {
    case 'class':
      return 'Classes';
    case 'lesson':
      return 'Lessons';
    case 'content':
      return 'Content';
    case 'student':
      return 'Students';
    default:
      return 'Results';
  }
};

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, results, isLoading } = useGlobalSearch();

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (route: string) => {
    setOpen(false);
    setSearchQuery('');
    navigate(route);
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search classes, lessons, content, students..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
          )}
          {!isLoading && searchQuery && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!isLoading &&
            Object.entries(groupedResults).map(([type, items]) => (
              <CommandGroup key={type} heading={getResultLabel(type)}>
                {items.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.name}
                    onSelect={() => handleSelect(result.route)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.name}</div>
                        {result.metadata && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.metadata.description || result.metadata.subject}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
