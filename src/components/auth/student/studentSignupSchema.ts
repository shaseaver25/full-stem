import { z } from 'zod';

export const studentSignupSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  gradeLevel: z
    .string()
    .min(1, 'Please select your grade level')
    .refine((val) => {
      const grade = parseInt(val);
      return grade >= 3 && grade <= 12;
    }, 'Grade level must be between 3 and 12'),
  preferredLanguage: z
    .string()
    .min(1, 'Please select your preferred language')
});

export type StudentSignupFormData = z.infer<typeof studentSignupSchema>;

export const SUPPORTED_LANGUAGES = [
  { value: 'English', label: 'English', flag: '🇺🇸' },
  { value: 'Spanish', label: 'Spanish (Español)', flag: '🇪🇸' },
  { value: 'Hmong', label: 'Hmong', flag: '🇱🇦' },
  { value: 'Somali', label: 'Somali (Soomaali)', flag: '🇸🇴' },
  { value: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
  { value: 'Chinese', label: 'Chinese (中文)', flag: '🇨🇳' },
  { value: 'Arabic', label: 'Arabic (العربية)', flag: '🇸🇦' },
  { value: 'French', label: 'French (Français)', flag: '🇫🇷' },
  { value: 'German', label: 'German (Deutsch)', flag: '🇩🇪' },
  { value: 'Portuguese', label: 'Portuguese (Português)', flag: '🇵🇹' }
] as const;

export const GRADE_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 3).toString(),
  label: `Grade ${i + 3}`
}));
