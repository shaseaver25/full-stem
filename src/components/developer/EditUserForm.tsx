import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, useUserManagement } from '@/hooks/useUserManagement';
import { Loader2, AlertTriangle, RotateCcw, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PasswordResetDialog } from './PasswordResetDialog';
import { toast } from '@/hooks/use-toast';

interface EditUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SUBJECTS = [
  'Math',
  'Science',
  'English/ELA',
  'Social Studies',
  'Special Education',
  'Art',
  'Music',
  'PE',
  'Computer Science',
  'Other'
];

export const EditUserForm: React.FC<EditUserFormProps> = ({ open, onOpenChange, user }) => {
  const { updateUser, isUpdating, availableClasses } = useUserManagement();
  
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: '',
    avatarUrl: '',
    bio: '',
    gradeLevel: user.gradeLevel || '',
    studentId: '',
    classIds: [] as string[],
    district: '',
    gradeLevelsTaught: [] as string[],
    subjectAreas: [] as string[],
    licenseNumber: '',
    adminType: 'school' as 'district' | 'school' | 'super',
    organization: '',
    status: user.status || 'active'
  });

  const [originalData, setOriginalData] = useState(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<string | null>(null);
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Reset form data when user changes
    const newData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: '',
      avatarUrl: '',
      bio: '',
      gradeLevel: user.gradeLevel || '',
      studentId: '',
      classIds: [] as string[],
      district: '',
      gradeLevelsTaught: [] as string[],
      subjectAreas: [] as string[],
      licenseNumber: '',
      adminType: 'school' as 'district' | 'school' | 'super',
      organization: '',
      status: user.status || 'active'
    };
    setFormData(newData);
    setOriginalData(newData);
  }, [user]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const getChangedFields = () => {
    const changed: string[] = [];
    Object.keys(formData).forEach((key) => {
      if (JSON.stringify(formData[key as keyof typeof formData]) !== 
          JSON.stringify(originalData[key as keyof typeof originalData])) {
        changed.push(key);
      }
    });
    return changed;
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.role === 'student' && !formData.gradeLevel) {
      newErrors.gradeLevel = 'Grade level is required for students';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = (newRole: string) => {
    if (newRole !== formData.role) {
      setPendingRoleChange(newRole);
      setShowRoleChangeDialog(true);
    }
  };

  const confirmRoleChange = () => {
    if (pendingRoleChange) {
      setFormData({ ...formData, role: pendingRoleChange });
      setPendingRoleChange(null);
    }
    setShowRoleChangeDialog(false);
  };

  const handleEmailChange = (newEmail: string) => {
    if (newEmail !== originalData.email && validateEmail(newEmail)) {
      setPendingEmailChange(newEmail);
      setShowEmailChangeDialog(true);
    } else {
      setFormData({ ...formData, email: newEmail });
    }
  };

  const confirmEmailChange = () => {
    if (pendingEmailChange) {
      setFormData({ ...formData, email: pendingEmailChange });
      setPendingEmailChange(null);
    }
    setShowEmailChangeDialog(false);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    updateUser(
      { 
        userId: user.id, 
        ...formData,
        role: formData.role as 'teacher' | 'student' | 'admin' | 'developer'
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast({
            title: '✅ User Updated',
            description: `Changes saved for ${formData.firstName} ${formData.lastName}`,
          });
        },
      }
    );
  };

  const handleRevert = (field: keyof typeof formData) => {
    setFormData({ ...formData, [field]: originalData[field] });
  };

  const changedFields = getChangedFields();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
            <DialogDescription>
              Update user information and manage account settings
            </DialogDescription>
          </DialogHeader>

          {hasChanges && (
            <div className="bg-warning/10 border border-warning rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">You have unsaved changes</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">
                    Email Address *
                    {changedFields.includes('email') && (
                      <Badge variant="secondary" className="ml-2">Modified</Badge>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={changedFields.includes('email') ? 'border-warning' : ''}
                    />
                    {changedFields.includes('email') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevert('email')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  {formData.email !== originalData.email && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ⚠️ Changing email requires user verification
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      First Name *
                      {changedFields.includes('firstName') && (
                        <Badge variant="secondary" className="ml-2">Modified</Badge>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={changedFields.includes('firstName') ? 'border-warning' : ''}
                      />
                      {changedFields.includes('firstName') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevert('firstName')}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">
                      Last Name *
                      {changedFields.includes('lastName') && (
                        <Badge variant="secondary" className="ml-2">Modified</Badge>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={changedFields.includes('lastName') ? 'border-warning' : ''}
                      />
                      {changedFields.includes('lastName') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevert('lastName')}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">
                    Role *
                    {changedFields.includes('role') && (
                      <Badge variant="secondary" className="ml-2">Modified</Badge>
                    )}
                  </Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className={changedFields.includes('role') ? 'border-warning' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.role !== originalData.role && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ⚠️ Changing role may affect user permissions and access
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {formData.role === 'student' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gradeLevel">Grade Level *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeLevel && (
                      <p className="text-sm text-destructive mt-1">{errors.gradeLevel}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <Label>Class Assignments</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {availableClasses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No classes available</p>
                      ) : (
                        availableClasses.map((cls) => (
                          <div key={cls.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`class-${cls.id}`}
                              checked={formData.classIds.includes(cls.id)}
                              onCheckedChange={(checked) => {
                                setFormData({
                                  ...formData,
                                  classIds: checked
                                    ? [...formData.classIds, cls.id]
                                    : formData.classIds.filter((id) => id !== cls.id),
                                });
                              }}
                            />
                            <Label htmlFor={`class-${cls.id}`} className="font-normal">
                              {cls.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'teacher' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Teacher Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="district">District/School</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Enter district or school name"
                    />
                  </div>

                  <div>
                    <Label>Grade Levels Taught</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                      {GRADE_LEVELS.map((grade) => (
                        <div key={grade} className="flex items-center space-x-2">
                          <Checkbox
                            id={`grade-${grade}`}
                            checked={formData.gradeLevelsTaught.includes(grade)}
                            onCheckedChange={(checked) => {
                              setFormData({
                                ...formData,
                                gradeLevelsTaught: checked
                                  ? [...formData.gradeLevelsTaught, grade]
                                  : formData.gradeLevelsTaught.filter((g) => g !== grade),
                              });
                            }}
                          />
                          <Label htmlFor={`grade-${grade}`} className="font-normal">
                            {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Subject Areas</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                      {SUBJECTS.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject}`}
                            checked={formData.subjectAreas.includes(subject)}
                            onCheckedChange={(checked) => {
                              setFormData({
                                ...formData,
                                subjectAreas: checked
                                  ? [...formData.subjectAreas, subject]
                                  : formData.subjectAreas.filter((s) => s !== subject),
                              });
                            }}
                          />
                          <Label htmlFor={`subject-${subject}`} className="font-normal">
                            {subject}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'admin' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Admin Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminType">Admin Type *</Label>
                    <Select
                      value={formData.adminType}
                      onValueChange={(value: 'district' | 'school' | 'super') =>
                        setFormData({ ...formData, adminType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School Admin</SelectItem>
                        <SelectItem value="district">District Admin</SelectItem>
                        <SelectItem value="super">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="organization">District/School</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Enter district or school name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Reset user password</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inactive"
                    checked={formData.status === 'inactive'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'inactive' : 'active' })
                    }
                  />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </div>
            </div>

            {/* Optional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Optional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio/Notes</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Additional notes about this user"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating || !hasChanges}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are changing {user.firstName} {user.lastName}'s role from{' '}
              <strong>{originalData.role}</strong> to <strong>{pendingRoleChange}</strong>.
              <br />
              <br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                {originalData.role === 'student' && <li>Remove student from all enrolled classes</li>}
                {pendingRoleChange === 'teacher' && <li>Grant access to teacher features</li>}
                {pendingRoleChange === 'admin' && <li>Grant administrative permissions</li>}
                <li>Change dashboard and permissions</li>
              </ul>
              <br />
              This action can be reversed, but may require manual restoration of some data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRoleChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Change Confirmation Dialog */}
      <AlertDialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Email Address Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing email from:
              <br />
              <strong>{originalData.email}</strong>
              <br />
              To:
              <br />
              <strong>{pendingEmailChange}</strong>
              <br />
              <br />
              <ul className="list-disc list-inside space-y-1">
                <li>Verification email will be sent to new address</li>
                <li>User must verify before new email is active</li>
                <li>Old email will work until verification</li>
                <li>User will be notified of this change</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEmailChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmEmailChange}>Change Email</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        open={showPasswordReset}
        onOpenChange={setShowPasswordReset}
        user={user}
      />
    </>
  );
};
