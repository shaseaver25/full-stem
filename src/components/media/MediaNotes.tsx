import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Globe,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

interface VocabItem {
  word: string;
  definition: string;
}

interface Questions {
  comprehension: string[];
  reflection: string[];
  challenge: string;
}

interface Translations {
  es: string;
  so: string;
  hm: string;
  om: string;
}

interface MediaNotesProps {
  media_id: string;
  transcript: string;
  summary_teacher: string;
  summary_student: string;
  themes: string[];
  vocab_list: VocabItem[];
  questions: Questions;
  translations: Translations;
  recommended_next: string[];
}

const LANGUAGE_MAP = {
  en: 'English',
  es: 'Spanish',
  so: 'Somali',
  hm: 'Hmong',
  om: 'Oromo',
} as const;

export function MediaNotes({
  transcript,
  summary_teacher,
  summary_student,
  themes,
  vocab_list,
  questions,
  translations,
  recommended_next,
}: MediaNotesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGE_MAP>('en');
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  const getCurrentSummary = () => {
    if (selectedLanguage === 'en') {
      return summary_student;
    }
    return translations[selectedLanguage as keyof Translations] || summary_student;
  };

  return (
    <div className="space-y-6">
      {/* Transcript Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-muted-foreground ${expandedTranscript ? '' : 'line-clamp-3'}`}>
            {transcript}
          </div>
          {transcript && transcript.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedTranscript(!expandedTranscript)}
              className="mt-2"
            >
              {expandedTranscript ? 'Show Less' : 'Show More'}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expandedTranscript ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-primary" />
        <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as keyof typeof LANGUAGE_MAP)}>
          <SelectTrigger className="w-[200px] bg-card">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {Object.entries(LANGUAGE_MAP).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teacher Summary */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Teacher Summary
          </CardTitle>
          <CardDescription>Detailed overview for educators</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{summary_teacher}</p>
        </CardContent>
      </Card>

      {/* Student Summary (with translation) */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Student Summary
            {selectedLanguage !== 'en' && (
              <Badge variant="secondary" className="ml-2">
                {LANGUAGE_MAP[selectedLanguage]}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Simplified overview for students</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{getCurrentSummary()}</p>
        </CardContent>
      </Card>

      {/* Themes */}
      {themes && themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Key Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, index) => (
                <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary */}
      {vocab_list && vocab_list.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vocab_list.map((item, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">{item.word}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {questions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Discussion Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comprehension Questions */}
            {questions.comprehension && questions.comprehension.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Comprehension</Badge>
                </h4>
                <ol className="space-y-3 list-decimal list-inside">
                  {questions.comprehension.map((q, index) => (
                    <li key={index} className="text-muted-foreground leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Separator />

            {/* Reflection Questions */}
            {questions.reflection && questions.reflection.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Reflection</Badge>
                </h4>
                <ol className="space-y-3 list-decimal list-inside">
                  {questions.reflection.map((q, index) => (
                    <li key={index} className="text-muted-foreground leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Separator />

            {/* Challenge Question */}
            {questions.challenge && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Badge variant="default">Challenge</Badge>
                </h4>
                <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary">
                  {questions.challenge}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Next */}
      {recommended_next && recommended_next.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Recommended Next Topics
            </CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommended_next.map((topic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-foreground">{topic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
