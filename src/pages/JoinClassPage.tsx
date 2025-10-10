import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function JoinClassPage() {
  const [classCode, setClassCode] = useState('');

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      toast({
        title: 'Class Code Required',
        description: 'Please enter a valid class code',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Coming Soon',
      description: 'Class joining functionality will be available soon!',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center">Join a Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Enter the class code provided by your teacher to join their class
            </p>

            <form onSubmit={handleJoinClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classCode">Class Code</Label>
                <Input
                  id="classCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Ask your teacher for the class code
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Join Class
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have a class code yet?
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard/student">← Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">What happens when you join?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Access personalized lessons from your teacher</li>
              <li>✅ Submit assignments and get feedback</li>
              <li>✅ Track your progress throughout the course</li>
              <li>✅ Receive tailored content based on your learning profile</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
