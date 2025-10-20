import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  dashboard: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'student@test.com', password: 'Student123!', role: 'Student', dashboard: '/dashboard/student' },
  { email: 'teacher@test.com', password: 'Teacher123!', role: 'Teacher', dashboard: '/teacher/dashboard' },
  { email: 'parent@test.com', password: 'Parent123!', role: 'Parent', dashboard: '/dashboard/parent' },
  { email: 'admin@test.com', password: 'Admin123!', role: 'Admin', dashboard: '/admin/dashboard' },
  { email: 'superadmin@test.com', password: 'Admin123!', role: 'Super Admin', dashboard: '/super-admin' },
  { email: 'developer@test.com', password: 'Dev123!', role: 'Developer', dashboard: '/dev' }
];

interface AccountResult {
  email: string;
  role?: string;
  status: 'created' | 'updated' | 'error';
  message?: string;
  userId?: string;
}

export const DemoAccountManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const createDemoAccounts = async () => {
    setIsCreating(true);
    setResults([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to create demo accounts');
        return;
      }

      const response = await supabase.functions.invoke('create-demo-accounts', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        toast.error(`Error: ${response.error.message}`);
        return;
      }

      const { results: accountResults } = response.data;
      setResults(accountResults);

      const successCount = accountResults.filter((r: AccountResult) => r.status !== 'error').length;
      const errorCount = accountResults.filter((r: AccountResult) => r.status === 'error').length;

      if (errorCount === 0) {
        toast.success(`Successfully processed all ${successCount} demo accounts`);
      } else {
        toast.warning(`Processed ${successCount} accounts with ${errorCount} errors`);
      }
    } catch (error: any) {
      console.error('Error creating demo accounts:', error);
      toast.error(`Failed to create demo accounts: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status?: 'created' | 'updated' | 'error') => {
    switch (status) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: 'created' | 'updated' | 'error') => {
    switch (status) {
      case 'created':
        return <Badge variant="default">Created</Badge>;
      case 'updated':
        return <Badge variant="secondary">Updated</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Demo Account Manager</CardTitle>
            <CardDescription>
              Create test accounts for all roles with standardized credentials
            </CardDescription>
          </div>
          <Button
            onClick={createDemoAccounts}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {isCreating ? 'Creating Accounts...' : 'Create Demo Accounts'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Dashboard Route</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_ACCOUNTS.map((account) => {
                  const result = results.find(r => r.email === account.email);
                  return (
                    <TableRow key={account.email}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result?.status)}
                          {getStatusBadge(result?.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{account.email}</TableCell>
                      <TableCell className="font-mono text-sm">{account.password}</TableCell>
                      <TableCell className="font-mono text-sm">{account.dashboard}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(account.email)}
                            title="Copy email"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(account.password)}
                            title="Copy password"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {results.length > 0 && (
            <div className="rounded-md border bg-muted/50 p-4">
              <h4 className="font-semibold mb-2">Creation Results:</h4>
              <ul className="space-y-1 text-sm">
                {results.map((result) => (
                  <li key={result.email} className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span>{result.email}:</span>
                    <span className="text-muted-foreground">
                      {result.status === 'error' ? result.message : result.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
            <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Security Warning
            </h4>
            <p className="text-sm text-muted-foreground">
              These are TEST accounts only. Never use these credentials in production. 
              Each account has a unique password shown in the table above.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
