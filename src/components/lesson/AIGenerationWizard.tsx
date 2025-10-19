import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAILessonWizard } from "@/hooks/useAILessonWizard";
import TeacherLessonView from "./TeacherLessonView";
import type { AILesson } from "@/types/aiLesson";

export default function AIGenerationWizard() {
  const [step, setStep] = useState(1);
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: "",
    readingLevel: "on-grade",
    language: "en",
    durationMinutes: 45,
    standards: [],
  });
  const { generateLesson, lesson, usage, isGenerating } = useAILessonWizard();

  function updateField(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate() {
    await generateLesson(form);
    setStep(3);
  }

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6 space-y-6">
      <CardHeader>
        <CardTitle>AI Lesson Plan Generator</CardTitle>
      </CardHeader>

      <Progress value={step * 33.33} className="w-full" />

      {step === 1 && (
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-lg">Step 1: Lesson Basics</h2>
          <Input 
            placeholder="Topic (e.g., Photosynthesis)" 
            value={form.topic} 
            onChange={(e) => updateField("topic", e.target.value)} 
          />
          <Input 
            placeholder="Subject (e.g., Biology)" 
            value={form.subject} 
            onChange={(e) => updateField("subject", e.target.value)} 
          />
          <Input 
            placeholder="Grade Level (e.g., 8)" 
            value={form.gradeLevel} 
            onChange={(e) => updateField("gradeLevel", e.target.value)} 
          />

          <div className="flex gap-4">
            <Select value={form.readingLevel} onValueChange={(v) => updateField("readingLevel", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reading Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emerging">Emerging</SelectItem>
                <SelectItem value="on-grade">On Grade</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={form.language} onValueChange={(v) => updateField("language", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={form.durationMinutes}
            onChange={(e) => updateField("durationMinutes", Number(e.target.value))}
          />

          <Button onClick={() => setStep(2)} disabled={!form.topic || !form.subject || !form.gradeLevel}>
            Next
          </Button>
        </CardContent>
      )}

      {step === 2 && (
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-lg">Step 2: Generate Lesson</h2>
          <p className="text-sm text-muted-foreground">
            Review your selections, then generate your AI-powered lesson plan.
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Topic:</strong> {form.topic}</div>
            <div><strong>Subject:</strong> {form.subject}</div>
            <div><strong>Grade:</strong> {form.gradeLevel}</div>
            <div><strong>Reading Level:</strong> {form.readingLevel}</div>
            <div><strong>Language:</strong> {form.language}</div>
            <div><strong>Duration:</strong> {form.durationMinutes} min</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Lesson"}
            </Button>

            <Button variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>
              Back
            </Button>
          </div>
        </CardContent>
      )}

      {step === 3 && lesson && (
        <TeacherLessonView
          lesson={lesson}
          lessonId={savedLessonId || undefined}
          classId={selectedClassId || undefined}
          onRegenerate={handleGenerate}
          onBack={() => setStep(2)}
        />
      )}
    </Card>
  );
}
