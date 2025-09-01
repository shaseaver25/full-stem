import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useSurveyData } from '@/hooks/useSurveyData';
import { SurveyQuestion } from '@/types/surveyTypes';
import { toast } from '@/hooks/use-toast';

interface LearningGeniusSurveyProps {
  onComplete?: () => void;
}

export const LearningGeniusSurvey: React.FC<LearningGeniusSurveyProps> = ({ onComplete }) => {
  const { survey, saveSurveyResponse, generateProfile, saveProfile, loadExistingResponses, responses, loading } = useSurveyData();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadExistingResponses();
  }, [loadExistingResponses]);

  useEffect(() => {
    // Load existing responses into answers
    const existingAnswers: Record<string, any> = {};
    responses.forEach(response => {
      existingAnswers[response.question_id] = response.answer_value;
    });
    setAnswers(existingAnswers);
  }, [responses]);

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  const calculateTags = (question: SurveyQuestion, answerValue: any): string[] => {
    const tags: string[] = [];

    switch (question.type) {
      case 'single_select':
        if (question.options && answerValue) {
          const selectedOption = question.options.find(opt => opt.label === answerValue);
          if (selectedOption) {
            tags.push(...selectedOption.tags);
          }
        }
        break;
      
      case 'multi_select':
        if (question.options && Array.isArray(answerValue)) {
          answerValue.forEach(selectedLabel => {
            const selectedOption = question.options!.find(opt => opt.label === selectedLabel);
            if (selectedOption) {
              tags.push(...selectedOption.tags);
            }
          });
        }
        break;
      
      case 'boolean':
        if (answerValue === true && question.true_tags) {
          tags.push(...question.true_tags);
        } else if (answerValue === false && question.false_tags) {
          tags.push(...question.false_tags);
        }
        break;
      
      case 'short_text':
      case 'long_text':
        if (question.tags_on_answer) {
          tags.push(...question.tags_on_answer);
        }
        break;
    }

    return tags;
  };

  const handleAnswer = async (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Calculate tags for this answer
    const tags = calculateTags(currentQuestion, value);
    
    // Save to database
    await saveSurveyResponse(currentQuestion.id, value, tags);
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    try {
      const profileData = await generateProfile();
      if (profileData) {
        const success = await saveProfile(profileData);
        if (success && onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate learning profile",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestion = () => {
    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'single_select':
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.label} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi_select':
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select up to {currentQuestion.max_select} options:
            </p>
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.label)}
                  onCheckedChange={(checked) => {
                    const currentSelections = Array.isArray(currentAnswer) ? currentAnswer : [];
                    let newSelections;
                    
                    if (checked) {
                      if (currentSelections.length < (currentQuestion.max_select || Infinity)) {
                        newSelections = [...currentSelections, option.label];
                      } else {
                        return; // Don't allow more selections than max_select
                      }
                    } else {
                      newSelections = currentSelections.filter(s => s !== option.label);
                    }
                    
                    handleAnswer(newSelections);
                  }}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <RadioGroup
            value={currentAnswer?.toString() || ''}
            onValueChange={(value) => handleAnswer(value === 'true')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        );

      case 'short_text':
        return (
          <Input
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full"
          />
        );

      case 'long_text':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'multi_select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    if (currentQuestion.type === 'boolean') {
      return answer !== undefined;
    }
    
    if (currentQuestion.type === 'short_text' || currentQuestion.type === 'long_text') {
      return typeof answer === 'string' && answer.trim().length > 0;
    }
    
    return answer !== undefined && answer !== '';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading survey...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {survey.title}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} of {survey.questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {currentQuestion.prompt}
            </h3>
            {renderQuestion()}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button 
                onClick={handleComplete}
                disabled={!isAnswered() || isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  "Creating Profile..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Survey
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!isAnswered()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};