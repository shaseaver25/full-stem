import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, UserX, Shield, Search } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

const UserImpersonation = () => {
  const { 
    isImpersonating, 
    impersonatedUser, 
    impersonatedRole, 
    startImpersonation, 
    stopImpersonation 
  } = useImpersonation();
  
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (profileError) throw profileError;

      const users = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        first_name: profile.full_name?.split(' ')[0] || '',
        last_name: profile.full_name?.split(' ').slice(1).join(' ') || '',
        role: 'user'
      })) || [];

      setSearchResults(users);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    if (!selectedRole) {
      setError('Please select a role to impersonate');
      return;
    }

    try {
      await startImpersonation(userId, selectedRole);
      setError(null);
    } catch (err) {
      setError('Failed to start impersonation');
      console.error('Impersonation error:', err);
    }
  };

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
      setError(null);
    } catch (err) {
      setError('Failed to stop impersonation');
      console.error('Stop impersonation error:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Impersonation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImpersonating ? (
          <div className="space-y-4">
            <Alert>
              <UserCheck className="h-4 w-4" />
              <AlertDescription>
                Currently impersonating: {impersonatedUser?.first_name} {impersonatedUser?.last_name} 
                as <Badge variant="outline">{impersonatedRole}</Badge>
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleStopImpersonation} variant="destructive" className="w-full">
              <UserX className="h-4 w-4 mr-2" />
              Stop Impersonation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search users by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role to impersonate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Search Results:</h4>
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      onClick={() => handleImpersonate(user.id)}
                      disabled={!selectedRole}
                      size="sm"
                    >
                      Impersonate
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserImpersonation;