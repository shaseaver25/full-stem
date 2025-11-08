import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Trash2, Edit, Plus, Copy } from 'lucide-react';
import { useQuestionBank, useDeleteFromQuestionBank, type QuestionBankQuestion } from '@/hooks/useQuestionBank';
import { Skeleton } from '@/components/ui/skeleton';

interface QuestionBankManagerProps {
  onAddToQuiz?: (questions: QuestionBankQuestion[]) => void;
}

export const QuestionBankManager = ({ onAddToQuiz }: QuestionBankManagerProps) => {
  const [search, setSearch] = useState('');
  const [questionType, setQuestionType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const { data: questions, isLoading } = useQuestionBank({
    search,
    questionType: questionType || undefined,
    difficulty: difficulty || undefined,
  });

  const deleteQuestion = useDeleteFromQuestionBank();

  const handleSelectQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions?.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions?.map(q => q.id) || []));
    }
  };

  const handleAddSelected = () => {
    if (!questions || !onAddToQuiz) return;
    const selected = questions.filter(q => selectedQuestions.has(q.id));
    onAddToQuiz(selected);
    setSelectedQuestions(new Set());
  };

  const handleDeleteSelected = () => {
    if (!confirm(`Delete ${selectedQuestions.size} questions?`)) return;
    selectedQuestions.forEach(id => deleteQuestion.mutate(id));
    setSelectedQuestions(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question Bank</CardTitle>
          <div className="flex gap-2">
            {selectedQuestions.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSelected}
                  disabled={!onAddToQuiz}
                >
                  Add {selectedQuestions.size} to Quiz
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
              <SelectItem value="fill_blank">Fill in Blank</SelectItem>
              <SelectItem value="multiple_select">Multiple Select</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Select All */}
        {questions && questions.length > 0 && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <Checkbox
              checked={selectedQuestions.size === questions.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select All ({questions.length})
            </span>
          </div>
        )}

        {/* Question List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !questions || questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No questions in your bank yet</p>
            <p className="text-sm text-muted-foreground">
              Create questions in the quiz builder and save them to your question bank
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(question => (
              <Card key={question.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => handleSelectQuestion(question.id)}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question_text}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {question.question_type.replace('_', ' ')}
                            </Badge>
                            {question.difficulty && (
                              <Badge
                                variant={
                                  question.difficulty === 'easy'
                                    ? 'default'
                                    : question.difficulty === 'medium'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                            )}
                            {question.tags?.map(tag => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {onAddToQuiz && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAddToQuiz([question])}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteQuestion.mutate(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {question.image_url && (
                        <img
                          src={question.image_url}
                          alt="Question"
                          className="w-32 h-24 object-cover rounded mt-2"
                        />
                      )}

                      {question.options && question.options.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {question.options.map(opt => (
                            <div
                              key={opt.id}
                              className={`text-sm px-2 py-1 rounded ${
                                opt.is_correct ? 'bg-green-50 text-green-700' : 'text-muted-foreground'
                              }`}
                            >
                              {opt.is_correct && '✓ '}
                              {opt.option_text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
