import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, usePasswordReset } from '@/hooks/useUserManagement';
import { Loader2, Mail, Key, Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

type ResetMethod = 'email' | 'temporary' | 'custom';

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { resetPassword, isResetting } = usePasswordReset();
  const [method, setMethod] = useState<ResetMethod>('email');
  const [customPassword, setCustomPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forceChange, setForceChange] = useState(true);
  const [notifyUser, setNotifyUser] = useState(true);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  const passwordRequirements = {
    length: customPassword.length >= 8,
    uppercase: /[A-Z]/.test(customPassword),
    lowercase: /[a-z]/.test(customPassword),
    number: /[0-9]/.test(customPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(customPassword),
  };

  const passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;
  const passwordsMatch = customPassword === confirmPassword && customPassword.length > 0;

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 4) return 'bg-warning';
    return 'bg-success';
  };

  const handleNext = () => {
    if (method === 'custom' && (!customPassword || !passwordsMatch)) {
      toast({
        title: 'Invalid Password',
        description: 'Please enter a valid password that meets all requirements',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm');
  };

  const handleReset = async () => {
    resetPassword(
      {
        userId: user.id,
        email: user.email,
        method,
        customPassword: method === 'custom' ? customPassword : undefined,
        forceChange,
        notifyUser,
      },
      {
        onSuccess: (data) => {
          if (method === 'temporary' && data.temporaryPassword) {
            setTempPassword(data.temporaryPassword);
          }
          setStep('success');
        },
      }
    );
  };

  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Temporary password copied to clipboard',
      });
    }
  };

  const handleClose = () => {
    setMethod('email');
    setCustomPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setForceChange(true);
    setNotifyUser(true);
    setTempPassword(null);
    setCopied(false);
    setStep('select');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Reset Password for {user.firstName} {user.lastName}</DialogTitle>
              <DialogDescription>Choose a password reset method</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <RadioGroup value={method} onValueChange={(value) => setMethod(value as ResetMethod)}>
                <div className="space-y-3">
                  {/* Email Reset */}
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      method === 'email' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setMethod('email')}
                  >
                    <RadioGroupItem value="email" id="email" />
                    <div className="flex-1">
                      <Label htmlFor="email" className="cursor-pointer font-medium">
                        Send Password Reset Email (Recommended)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        User will receive a secure link to create a new password
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span className="text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Temporary Password */}
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      method === 'temporary' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setMethod('temporary')}
                  >
                    <RadioGroupItem value="temporary" id="temporary" />
                    <div className="flex-1">
                      <Label htmlFor="temporary" className="cursor-pointer font-medium">
                        Generate Temporary Password
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        System creates a temporary password that you can share with the user
                      </p>
                      <p className="text-sm text-warning mt-1">⚠️ User must change on first login</p>
                    </div>
                  </div>

                  {/* Custom Password */}
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      method === 'custom' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setMethod('custom')}
                  >
                    <RadioGroupItem value="custom" id="custom" />
                    <div className="flex-1">
                      <Label htmlFor="custom" className="cursor-pointer font-medium">
                        Set Custom Password
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manually enter a new password for this user
                      </p>
                      <p className="text-sm text-warning mt-1">⚠️ Not recommended for security</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              {/* Custom Password Fields */}
              {method === 'custom' && (
                <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <p>
                      Setting passwords manually is less secure. Consider using the reset email method.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {customPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{getPasswordStrengthLabel()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && passwordsMatch && (
                      <p className="text-sm text-success mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Requirements:</Label>
                    <ul className="mt-2 space-y-1">
                      {Object.entries({
                        length: 'At least 8 characters',
                        uppercase: 'One uppercase letter',
                        lowercase: 'One lowercase letter',
                        number: 'One number',
                        special: 'One special character',
                      }).map(([key, label]) => (
                        <li
                          key={key}
                          className={`text-sm flex items-center gap-2 ${
                            passwordRequirements[key as keyof typeof passwordRequirements]
                              ? 'text-success'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {passwordRequirements[key as keyof typeof passwordRequirements] ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <span className="h-3 w-3" />
                          )}
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="forceChange"
                        checked={forceChange}
                        onCheckedChange={(checked) => setForceChange(checked as boolean)}
                      />
                      <Label htmlFor="forceChange" className="font-normal">
                        Force password change on next login
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyUser"
                        checked={notifyUser}
                        onCheckedChange={(checked) => setNotifyUser(checked as boolean)}
                      />
                      <Label htmlFor="notifyUser" className="font-normal">
                        Notify user via email
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                {method === 'email' ? 'Next' : 'Set Password'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Password Reset</DialogTitle>
              <DialogDescription>
                {method === 'email' && 'Send password reset email'}
                {method === 'temporary' && 'Generate temporary password'}
                {method === 'custom' && 'Set custom password'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {method === 'email' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="font-medium">Send password reset email to:</p>
                  </div>
                  <p className="text-lg font-semibold">{user.email}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>The user will receive:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Secure reset link (expires in 1 hour)</li>
                      <li>Instructions to create new password</li>
                      <li>Notification of account access</li>
                    </ul>
                  </div>
                </div>
              )}

              {method === 'temporary' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <p className="font-medium">Generate temporary password</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Important:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Share this password securely with the user</li>
                      <li>User MUST change on first login</li>
                      <li>Password expires in 7 days</li>
                      <li>This cannot be shown again</li>
                    </ul>
                  </div>
                </div>
              )}

              {method === 'custom' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <p className="font-medium">Set custom password for {user.firstName}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {forceChange && (
                      <p className="text-muted-foreground">
                        ✓ User will be required to change password on first login
                      </p>
                    )}
                    {notifyUser && (
                      <p className="text-muted-foreground">✓ User will be notified via email</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={handleReset} disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {method === 'email' && 'Send Reset Email'}
                {method === 'temporary' && 'Generate Password'}
                {method === 'custom' && 'Set Password'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <Check className="h-5 w-5" />
                {method === 'email' && 'Password Reset Email Sent'}
                {method === 'temporary' && 'Temporary Password Generated'}
                {method === 'custom' && 'Password Set Successfully'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {method === 'email' && (
                <div className="border rounded-lg p-4 space-y-2 bg-success/5">
                  <p className="font-medium">
                    {user.email} will receive reset instructions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The reset link will expire in 1 hour.
                  </p>
                </div>
              )}

              {method === 'temporary' && tempPassword && (
                <div className="space-y-4">
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <Label className="text-sm">Temporary Password</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-lg font-mono bg-background p-3 rounded border">
                        {tempPassword}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyPassword}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-warning/5">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Important
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Share this password securely with the user</li>
                      <li>User must change password on first login</li>
                      <li>Password expires in 7 days</li>
                      <li>This cannot be shown again after closing</li>
                    </ul>
                  </div>
                </div>
              )}

              {method === 'custom' && (
                <div className="border rounded-lg p-4 bg-success/5">
                  <p className="font-medium">Password has been set successfully.</p>
                  {notifyUser && (
                    <p className="text-sm text-muted-foreground mt-2">
                      User has been notified via email.
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
