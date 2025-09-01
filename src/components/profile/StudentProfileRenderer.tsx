import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Brain, 
  Heart, 
  Lightbulb, 
  Shield, 
  Sparkles,
  BookOpen,
  MessageSquare,
  Languages,
  Volume2
} from 'lucide-react';
import { ProfileData, LEARNING_STYLES, INTERESTS, MOTIVATION_TRIGGERS, SUPPORT_NEEDS } from '@/types/surveyTypes';

interface StudentProfileRendererProps {
  profileData: ProfileData;
  studentName?: string;
  onGenerateProject?: () => void;
  onSuggestModifications?: () => void;
  onTranslateMaterials?: () => void;
}

export const StudentProfileRenderer: React.FC<StudentProfileRendererProps> = ({
  profileData,
  studentName,
  onGenerateProject,
  onSuggestModifications,
  onTranslateMaterials
}) => {
  const getReadableLabel = (key: string, category: 'style' | 'interest' | 'motivation' | 'support') => {
    switch (category) {
      case 'style':
        return LEARNING_STYLES[key as keyof typeof LEARNING_STYLES] || key;
      case 'interest':
        return INTERESTS[key as keyof typeof INTERESTS] || key;
      case 'motivation':
        return MOTIVATION_TRIGGERS[key as keyof typeof MOTIVATION_TRIGGERS] || key;
      case 'support':
        if (key.startsWith('needs_translation:')) {
          return `Translation: ${key.split(':')[1]}`;
        }
        return SUPPORT_NEEDS[key as keyof typeof SUPPORT_NEEDS] || key;
      default:
        return key;
    }
  };

  const getStyleDescription = (style: string) => {
    const descriptions = {
      visual: "Learns best through images, diagrams, and visual demonstrations",
      auditory: "Learns best through listening, discussions, and verbal explanations",
      read_write: "Learns best through reading, writing, and text-based materials",
      kinesthetic: "Learns best through hands-on activities and physical practice"
    };
    return descriptions[style as keyof typeof descriptions] || "";
  };

  const getMotivationDescription = () => {
    if (profileData.motivation_triggers.length === 0) return "";
    
    const triggers = profileData.motivation_triggers.map(trigger => 
      getReadableLabel(trigger, 'motivation').toLowerCase()
    ).join(' and ');
    
    return `Thrives with ${triggers} tasks`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {profileData.preferred_name || studentName || 'Student'} - Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="md:col-span-3 flex flex-wrap gap-2">
              <Button onClick={onGenerateProject} size="sm" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Project Idea
              </Button>
              <Button onClick={onSuggestModifications} size="sm" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Suggest Assignment Modifications
              </Button>
              <Button onClick={onTranslateMaterials} size="sm" variant="outline">
                <Languages className="h-4 w-4 mr-2" />
                Translate Class Materials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Learning Styles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.learning_styles.slice(0, 2).map((style, index) => (
              <div key={style} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Primary" : "Secondary"}
                  </Badge>
                  <span className="font-medium">{getReadableLabel(style, 'style')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getStyleDescription(style)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Top Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.top_interests.map(interest => (
                <Badge key={interest} variant="outline" className="border-red-200">
                  {getReadableLabel(interest, 'interest')}
                </Badge>
              ))}
            </div>
            {profileData.top_interests.length === 0 && (
              <p className="text-sm text-muted-foreground">No specific interests identified</p>
            )}
          </CardContent>
        </Card>

        {/* Motivation Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profileData.motivation_triggers.map(trigger => (
                  <Badge key={trigger} variant="outline" className="border-yellow-200">
                    {getReadableLabel(trigger, 'motivation')}
                  </Badge>
                ))}
              </div>
              {getMotivationDescription() && (
                <p className="text-sm text-muted-foreground italic">
                  {getMotivationDescription()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Needs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Supports & Accommodations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profileData.support_needs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.support_needs.map(need => (
                    <Badge key={need} variant="outline" className="border-green-200">
                      {need.includes('needs_tts') && <Volume2 className="h-3 w-3 mr-1" />}
                      {need.includes('needs_translation') && <Languages className="h-3 w-3 mr-1" />}
                      {getReadableLabel(need, 'support')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific accommodations needs identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileData.ai_recommendations.project_templates.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Project Templates</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.ai_recommendations.project_templates.map(template => (
                  <Badge key={template} variant="secondary">
                    {template.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profileData.ai_recommendations.assignment_preferences.presentation_modes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Preferred Presentation Modes</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.ai_recommendations.assignment_preferences.presentation_modes.map(mode => (
                  <Badge key={mode} variant="outline">
                    {mode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profileData.ai_recommendations.assignment_preferences.scaffolds.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recommended Scaffolds</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.ai_recommendations.assignment_preferences.scaffolds.map(scaffold => (
                  <Badge key={scaffold} variant="outline">
                    {scaffold.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Notes */}
      {profileData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              Teacher Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{profileData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};