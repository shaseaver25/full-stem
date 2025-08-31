import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Mail, Sparkles, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DemoRequestForm {
  fullName: string;
  workEmail: string;
  role: string;
  schoolOrDistrict: string;
  consent: boolean;
}

const DEMO_MODE = true; // Feature flag - set from env in real implementation

const DemoGate = () => {
  const [form, setForm] = useState<DemoRequestForm>({
    fullName: '',
    workEmail: '',
    role: '',
    schoolOrDistrict: '',
    consent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  if (!DEMO_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Demo access is currently unavailable.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the terms to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/demo-request-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          workEmail: form.workEmail,
          role: form.role,
          schoolOrDistrict: form.schoolOrDistrict
        })
      });

      if (!response.ok) {
        throw new Error('Failed to request demo link');
      }

      const data = await response.json();
      
      // Create a demo link using the current domain to avoid cross-domain issues
      const currentOrigin = window.location.origin;
      const demoLink = `${currentOrigin}/demo/start?token=${data.token}`;
      
      setPreviewUrl(demoLink);
      setIsSubmitted(true);

      toast({
        title: "Demo Link Created!",
        description: `Check your email at ${form.workEmail} for your demo link. If you don't see it, use the link below.`
      });

    } catch (error) {
      console.error('Error requesting demo link:', error);
      toast({
        title: "Error",
        description: "Failed to send demo link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPreviewLink = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      toast({
        title: "Link Copied",
        description: "Demo link copied to clipboard"
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email!</CardTitle>
            <CardDescription>
              We've sent a demo link to <strong>{form.workEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Your demo sandbox is valid for <strong>60 minutes</strong> and contains synthetic data only.
                Perfect for exploring our AI-powered personalization features!
              </AlertDescription>
            </Alert>

            {previewUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Development Preview Link:</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={previewUrl} readOnly className="font-mono text-sm" />
                  <Button size="sm" variant="outline" onClick={copyPreviewLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">AI Courses</h4>
                <p className="text-sm text-muted-foreground">Pre-built courses with diverse content</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold">Diverse Students</h4>
                <p className="text-sm text-muted-foreground">24 fake students with varied needs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Full Analytics</h4>
                <p className="text-sm text-muted-foreground">Complete grade & progress tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Try TailorEDU Demo</CardTitle>
          <CardDescription className="text-lg">
            Experience AI-powered personalization in education with our interactive sandbox
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="workEmail">Work Email *</Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={form.workEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, workEmail: e.target.value }))}
                  required
                  placeholder="name@school.edu"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={form.role} onValueChange={(value) => setForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="District Admin">District Admin</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="schoolOrDistrict">School/District *</Label>
                <Input
                  id="schoolOrDistrict"
                  value={form.schoolOrDistrict}
                  onChange={(e) => setForm(prev => ({ ...prev, schoolOrDistrict: e.target.value }))}
                  required
                  placeholder="Lincoln Elementary"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, consent: !!checked }))}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                I understand this is a sandbox with synthetic data and agree to receive demo-related communications.
              </Label>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>What you'll experience:</strong> Complete course management, 24 diverse AI students with varied languages/needs, 
                personalized assignments, grade analytics, and parent communication tools.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || !form.fullName || !form.workEmail || !form.role || !form.schoolOrDistrict || !form.consent}
            >
              {isLoading ? 'Sending Demo Link...' : 'Send My Demo Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoGate;