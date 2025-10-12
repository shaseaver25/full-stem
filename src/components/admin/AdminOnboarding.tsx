import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminProfile, AdminType } from '@/hooks/useAdminProfile';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Home, Briefcase } from 'lucide-react';

export const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateAdminProfile } = useAdminProfile();
  const [step, setStep] = useState(1);
  const [adminType, setAdminType] = useState<AdminType>('school');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSize, setOrganizationSize] = useState('');

  const handleComplete = async () => {
    const success = await updateAdminProfile({
      admin_type: adminType,
      organization_name: organizationName,
      organization_size: organizationSize,
      onboarding_completed: true,
    });

    if (success) {
      toast({
        title: 'Setup complete!',
        description: 'Welcome to your admin dashboard.',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save onboarding data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    await updateAdminProfile({ onboarding_completed: true });
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to TailorEDU Admin</CardTitle>
          <CardDescription>
            Let's set up your account to provide the best experience
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">What type of organization are you?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us customize your dashboard and features
                </p>
              </div>

              <RadioGroup value={adminType} onValueChange={(v) => setAdminType(v as AdminType)}>
                <div className="grid gap-4">
                  <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${adminType === 'school' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="school" id="school" />
                    <div className="flex-1" onClick={() => setAdminType('school')}>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-5 w-5" />
                        <Label htmlFor="school" className="font-semibold cursor-pointer">
                          School Administrator
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Managing teachers, students, and classes for a K-12 school
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${adminType === 'homeschool' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="homeschool" id="homeschool" />
                    <div className="flex-1" onClick={() => setAdminType('homeschool')}>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="h-5 w-5" />
                        <Label htmlFor="homeschool" className="font-semibold cursor-pointer">
                          Homeschool Parent
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Teaching your own children at home with custom curriculum
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${adminType === 'workforce' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="workforce" id="workforce" />
                    <div className="flex-1" onClick={() => setAdminType('workforce')}>
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-5 w-5" />
                        <Label htmlFor="workforce" className="font-semibold cursor-pointer">
                          Workforce Center
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Training participants for job skills and certifications
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tell us about your organization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This information helps us provide relevant resources
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder={adminType === 'homeschool' ? 'Smith Family Homeschool' : 'Your organization name'}
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-size">Organization Size</Label>
                  <Select value={organizationSize} onValueChange={setOrganizationSize}>
                    <SelectTrigger id="org-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminType === 'homeschool' ? (
                        <>
                          <SelectItem value="1-2">1-2 students</SelectItem>
                          <SelectItem value="3-5">3-5 students</SelectItem>
                          <SelectItem value="6+">6+ students</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="1-50">1-50 {adminType === 'workforce' ? 'participants' : 'students'}</SelectItem>
                          <SelectItem value="51-200">51-200 {adminType === 'workforce' ? 'participants' : 'students'}</SelectItem>
                          <SelectItem value="201-500">201-500 {adminType === 'workforce' ? 'participants' : 'students'}</SelectItem>
                          <SelectItem value="500+">500+ {adminType === 'workforce' ? 'participants' : 'students'}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your dashboard has been customized for your needs
                </p>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Organization Type:</span>
                  <span className="text-sm capitalize">{adminType}</span>
                </div>
                {organizationName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Organization:</span>
                    <span className="text-sm">{organizationName}</span>
                  </div>
                )}
                {organizationSize && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Size:</span>
                    <span className="text-sm">{organizationSize}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Complete Setup
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
