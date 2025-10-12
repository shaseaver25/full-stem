import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface SandboxDataManagerProps {
  isProduction: boolean;
}

export const SandboxDataManager = ({ isProduction }: SandboxDataManagerProps) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    if (isProduction) {
      toast({
        title: "Operation Blocked",
        description: "Sandbox seeding is disabled in production environment",
        variant: "destructive"
      });
      return;
    }

    setIsSeeding(true);
    try {
      const { error } = await supabase.rpc('seed_dev_sandbox_data');
      
      if (error) throw error;

      toast({
        title: "Sandbox Seeded",
        description: "Demo data has been copied to sandbox tables for testing"
      });
    } catch (error: any) {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (isProduction) {
      toast({
        title: "Operation Blocked",
        description: "Sandbox reset is disabled in production environment",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reset the sandbox? This will delete all test data."
    );
    
    if (!confirmed) return;

    setIsResetting(true);
    try {
      const { error } = await supabase.rpc('reset_dev_sandbox');
      
      if (error) throw error;

      toast({
        title: "Sandbox Reset",
        description: "All sandbox tables have been cleared"
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sandbox Data Management
        </CardTitle>
        <CardDescription>
          Isolated testing environment - changes here do not affect production data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProduction && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Destructive operations are disabled in production. Use development environment for testing.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-semibold">Seed Demo Data</h3>
              <p className="text-sm text-muted-foreground">
                Populate sandbox tables with sample data from demo accounts
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  dev_sandbox_students
                </span>
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  dev_sandbox_classes
                </span>
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  dev_sandbox_grades
                </span>
              </div>
            </div>
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding || isProduction}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
              Seed Data
            </Button>
          </div>

          <div className="flex items-start justify-between p-4 border rounded-lg border-destructive/50">
            <div className="space-y-1">
              <h3 className="font-semibold text-destructive">Reset Sandbox</h3>
              <p className="text-sm text-muted-foreground">
                Clear all data from sandbox tables (cannot be undone)
              </p>
            </div>
            <Button 
              onClick={handleReset}
              disabled={isResetting || isProduction}
              variant="destructive"
              size="sm"
            >
              <Trash2 className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
              Reset
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Sandbox Tables</h4>
          <p className="text-sm text-muted-foreground mb-3">
            These tables are isolated copies for testing. Changes here never affect production.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-xs p-2 bg-muted rounded">
              <code>dev_sandbox_students</code>
            </div>
            <div className="text-xs p-2 bg-muted rounded">
              <code>dev_sandbox_grades</code>
            </div>
            <div className="text-xs p-2 bg-muted rounded">
              <code>dev_sandbox_classes</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};