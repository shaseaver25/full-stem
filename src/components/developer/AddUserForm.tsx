import React, { useState } from 'react';
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
import { CreateUserData, useUserManagement } from '@/hooks/useUserManagement';
import { Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AddUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const generatePassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const AddUserForm: React.FC<AddUserFormProps> = ({ open, onOpenChange }) => {
  const { createUser, isCreating, availableClasses } = useUserManagement();
  
  const [formData, setFormData] = useState<Partial<CreateUserData>>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phone: '',
    avatarUrl: '',
    bio: '',
    sendWelcomeEmail: true,
    gradeLevel: '',
    studentId: '',
    classIds: [],
    district: '',
    gradeLevelsTaught: [],
    subjectAreas: [],
    licenseNumber: '',
    adminType: 'school',
    organization: '',
    password: generatePassword()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    if (!validateForm()) return;

    createUser(formData as CreateUserData, {
      onSuccess: () => {
        // Reset form
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'student',
          phone: '',
          avatarUrl: '',
          bio: '',
          sendWelcomeEmail: true,
          gradeLevel: '',
          studentId: '',
          classIds: [],
          district: '',
          gradeLevelsTaught: [],
          subjectAreas: [],
          licenseNumber: '',
          adminType: 'school',
          organization: '',
          password: generatePassword()
        });
        setErrors({});
        onOpenChange(false);
      }
    });
  };

  const toggleGradeLevel = (grade: string) => {
    const current = formData.gradeLevelsTaught || [];
    if (current.includes(grade)) {
      setFormData({
        ...formData,
        gradeLevelsTaught: current.filter(g => g !== grade)
      });
    } else {
      setFormData({
        ...formData,
        gradeLevelsTaught: [...current, grade]
      });
    }
  };

  const toggleSubject = (subject: string) => {
    const current = formData.subjectAreas || [];
    if (current.includes(subject)) {
      setFormData({
        ...formData,
        subjectAreas: current.filter(s => s !== subject)
      });
    } else {
      setFormData({
        ...formData,
        subjectAreas: [...current, subject]
      });
    }
  };

  const toggleClass = (classId: string) => {
    const current = formData.classIds || [];
    if (current.includes(classId)) {
      setFormData({
        ...formData,
        classIds: current.filter(id => id !== classId)
      });
    } else {
      setFormData({
        ...formData,
        classIds: [...current, classId]
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with role-specific settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => {
                  if (formData.email && !validateEmail(formData.email)) {
                    setErrors({ ...errors, email: 'Please enter a valid email address' });
                  } else {
                    const { email, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Temporary Password <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Auto-generated password"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData({ ...formData, password: generatePassword() })}
                  title="Generate new password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                User will receive this password via email and can change it after first login.
              </p>
            </div>
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-semibold text-sm">Student Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">
                  Grade Level <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gradeLevel && (
                  <p className="text-sm text-destructive">{errors.gradeLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID (Optional)</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="District student ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign to Classes (Optional)</Label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {availableClasses.map((cls: any) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${cls.id}`}
                        checked={formData.classIds?.includes(cls.id)}
                        onCheckedChange={() => toggleClass(cls.id)}
                      />
                      <label
                        htmlFor={`class-${cls.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {cls.name} - {cls.teacherName}
                      </label>
                    </div>
                  ))}
                  {availableClasses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No classes available
                    </p>
                  )}
                </div>
                {formData.classIds && formData.classIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.classIds.length} class(es) selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Teacher-specific fields */}
          {formData.role === 'teacher' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-semibold text-sm">Teacher Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="district">District/School (Optional)</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="School or district name"
                />
              </div>

              <div className="space-y-2">
                <Label>Grade Levels Taught</Label>
                <div className="flex flex-wrap gap-2">
                  {GRADE_LEVELS.map(grade => (
                    <Badge
                      key={grade}
                      variant={formData.gradeLevelsTaught?.includes(grade) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleGradeLevel(grade)}
                    >
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => (
                    <Badge
                      key={subject}
                      variant={formData.subjectAreas?.includes(subject) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSubject(subject)}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Teacher License Number (Optional)</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="License number"
                />
              </div>
            </div>
          )}

          {/* Admin-specific fields */}
          {formData.role === 'admin' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-semibold text-sm">Admin Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="adminType">Admin Type</Label>
                <Select
                  value={formData.adminType}
                  onValueChange={(value: any) => setFormData({ ...formData, adminType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School Admin</SelectItem>
                    <SelectItem value="district">District Admin</SelectItem>
                    <SelectItem value="super">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">District/School Assignment</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Organization name"
                />
              </div>
            </div>
          )}

          {/* Optional fields for all roles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Optional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Notes</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Internal notes about this user"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, sendWelcomeEmail: !!checked })
                }
              />
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Send welcome email with account setup instructions
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
