
import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Settings, Volume2, Globe, BookOpen, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAuth } from '@/contexts/AuthContext';
import { AccessibilityToggle } from '@/components/ui/AccessibilityToggle';

interface PreferencesFormData {
  preferredLanguage: string;
  enableTranslationView: boolean;
  enableReadAloud: boolean;
  readingLevel: string;
  textSpeed: string;
}

const UserPreferences = () => {
  const { user } = useAuth();
  const { preferences, loading, saving, savePreferences } = useUserPreferences();

  const form = useForm<PreferencesFormData>({
    defaultValues: {
      preferredLanguage: '',
      enableTranslationView: false,
      enableReadAloud: false,
      readingLevel: '',
      textSpeed: 'Normal',
    },
  });

  // Update form when preferences are loaded
  React.useEffect(() => {
    if (preferences) {
      form.reset({
        preferredLanguage: preferences['Preferred Language'] || '',
        enableTranslationView: preferences['Enable Translation View'] || false,
        enableReadAloud: preferences['Enable Read-Aloud'] || false,
        readingLevel: preferences['Reading Level'] || '',
        textSpeed: preferences['Text Speed'] || 'Normal',
      });
    }
  }, [preferences, form]);

  const onSubmit = async (data: PreferencesFormData) => {
    await savePreferences({
      'Preferred Language': data.preferredLanguage || null,
      'Enable Translation View': data.enableTranslationView,
      'Enable Read-Aloud': data.enableReadAloud,
      'Reading Level': data.readingLevel || null,
      'Text Speed': data.textSpeed || null,
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const testText = "This is a test of the read-aloud functionality. You can use this button to listen to content when the read-aloud feature is enabled in your preferences.";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* User Preferences Content */}
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Accessibility Settings */}
          <AccessibilityToggle />

          {/* Legacy Preferences */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Learning Preferences</CardTitle>
              <p className="text-gray-600 mt-2">
                Customize your learning experience with accessibility and reading options.
              </p>
              {user?.email && (
                <p className="text-sm text-gray-500">
                  Settings for: {user.email}
                </p>
              )}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Read-aloud functionality is now available globally via the floating button in the top-right corner of any page.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Preferred Language */}
                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Preferred Language
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your preferred language (e.g., English, Somali, Spanish)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Type your preferred language for learning content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Enable Translation View */}
                  <FormField
                    control={form.control}
                    name="enableTranslationView"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-base">
                            <Globe className="h-4 w-4" />
                            Enable Translation View
                          </FormLabel>
                          <FormDescription>
                            Show content in both English and your preferred language.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Enable Read-Aloud */}
                  <FormField
                    control={form.control}
                    name="enableReadAloud"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-base">
                            <Volume2 className="h-4 w-4" />
                            Enable Read-Aloud
                          </FormLabel>
                          <FormDescription>
                            Have content read aloud to you automatically.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Reading Level */}
                  <FormField
                    control={form.control}
                    name="readingLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Reading Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your reading level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Grade 3">Grade 3</SelectItem>
                            <SelectItem value="Grade 5">Grade 5</SelectItem>
                            <SelectItem value="Grade 8">Grade 8</SelectItem>
                            <SelectItem value="High School">High School</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the reading level that works best for you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Text Speed */}
                  <FormField
                    control={form.control}
                    name="textSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Gauge className="h-4 w-4" />
                          Text Speed
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select text reading speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Slow">Slow</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Fast">Fast</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Control how fast text is read aloud or displayed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={saving}
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving Preferences...
                        </div>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserPreferences;
