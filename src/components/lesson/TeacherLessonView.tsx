import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Edit2, Save, RefreshCw, Check } from "lucide-react";
import type { AILesson } from "@/types/aiLesson";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeacherLessonViewProps {
  lesson: AILesson;
  onRegenerate: () => void;
  onBack: () => void;
}

export default function TeacherLessonView({ lesson, onRegenerate, onBack }: TeacherLessonViewProps) {
  const [editedLesson, setEditedLesson] = useState<AILesson>(lesson);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveSection = () => {
    setEditingSection(null);
    toast({
      title: "Section updated",
      description: "Your changes have been saved locally.",
    });
  };

  const handleSaveLesson = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: teacherProfile } = await supabase
        .from("teacher_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!teacherProfile) {
        throw new Error("Teacher profile not found");
      }

      const { error } = await supabase.from("lessons_generated").insert({
        teacher_id: teacherProfile.id,
        topic: editedLesson.meta.topic,
        grade_level: editedLesson.meta.gradeLevel,
        subject: editedLesson.meta.subject,
        lesson_json: editedLesson as any,
      });

      if (error) throw error;

      toast({
        title: "Lesson saved successfully",
        description: "Your AI-generated lesson has been saved to your library.",
      });
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Failed to save lesson",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (path: string[], value: any) => {
    setEditedLesson((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl">
                AI-Generated Lesson Plan: {editedLesson.meta.topic}
              </CardTitle>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span><strong>Subject:</strong> {editedLesson.meta.subject}</span>
                <span><strong>Grade:</strong> {editedLesson.meta.gradeLevel}</span>
                <span><strong>Duration:</strong> {editedLesson.meta.durationMinutes} min</span>
                <span><strong>Reading Level:</strong> {editedLesson.meta.readingLevel}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Objectives Section */}
              <Section
                title="Learning Objectives"
                isEditing={editingSection === "objectives"}
                onEdit={() => handleEdit("objectives")}
                onSave={handleSaveSection}
              >
                {editingSection === "objectives" ? (
                  <Textarea
                    value={editedLesson.objectives.join("\n")}
                    onChange={(e) =>
                      updateSection(["objectives"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[100px]"
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {editedLesson.objectives.map((obj, i) => (
                      <li key={i} className="text-sm">{obj}</li>
                    ))}
                  </ul>
                )}
              </Section>

              <Separator />

              {/* Vocabulary Section */}
              {editedLesson.vocabulary && editedLesson.vocabulary.length > 0 && (
                <>
                  <Section
                    title="Key Vocabulary"
                    isEditing={editingSection === "vocabulary"}
                    onEdit={() => handleEdit("vocabulary")}
                    onSave={handleSaveSection}
                  >
                    {editingSection === "vocabulary" ? (
                      <Textarea
                        value={editedLesson.vocabulary?.join("\n") || ""}
                        onChange={(e) =>
                          updateSection(["vocabulary"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[100px]"
                      />
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {editedLesson.vocabulary?.map((term, i) => (
                          <li key={i} className="text-sm"><strong>{term}</strong></li>
                        ))}
                      </ul>
                    )}
                  </Section>
                  <Separator />
                </>
              )}

              {/* Materials Section */}
              <Section
                title="Materials Needed"
                isEditing={editingSection === "materials"}
                onEdit={() => handleEdit("materials")}
                onSave={handleSaveSection}
              >
                {editingSection === "materials" ? (
                  <Textarea
                    value={editedLesson.materials.join("\n")}
                    onChange={(e) =>
                      updateSection(["materials"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[100px]"
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {editedLesson.materials.map((mat, i) => (
                      <li key={i} className="text-sm">{mat}</li>
                    ))}
                  </ul>
                )}
              </Section>

              <Separator />

              {/* Warm-Up Section */}
              <Section
                title={`Warm-Up (${editedLesson.warmup.minutes} minutes)`}
                isEditing={editingSection === "warmup"}
                onEdit={() => handleEdit("warmup")}
                onSave={handleSaveSection}
              >
                {editingSection === "warmup" ? (
                  <Textarea
                    value={editedLesson.warmup.steps.join("\n")}
                    onChange={(e) =>
                      updateSection(["warmup", "steps"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[100px]"
                  />
                ) : (
                  <ol className="list-decimal list-inside space-y-2">
                    {editedLesson.warmup.steps.map((step, i) => (
                      <li key={i} className="text-sm">{step}</li>
                    ))}
                  </ol>
                )}
              </Section>

              <Separator />

              {/* Direct Instruction Section */}
              <Section
                title={`Direct Instruction (${editedLesson.directInstruction.minutes} minutes)`}
                isEditing={editingSection === "directInstruction"}
                onEdit={() => handleEdit("directInstruction")}
                onSave={handleSaveSection}
              >
                {editingSection === "directInstruction" ? (
                  <Textarea
                    value={editedLesson.directInstruction.steps.join("\n")}
                    onChange={(e) =>
                      updateSection(["directInstruction", "steps"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[150px]"
                  />
                ) : (
                  <ol className="list-decimal list-inside space-y-2">
                    {editedLesson.directInstruction.steps.map((step, i) => (
                      <li key={i} className="text-sm">{step}</li>
                    ))}
                  </ol>
                )}
              </Section>

              <Separator />

              {/* Guided Practice Section */}
              <Section
                title={`Guided Practice (${editedLesson.guidedPractice.minutes} minutes)`}
                isEditing={editingSection === "guidedPractice"}
                onEdit={() => handleEdit("guidedPractice")}
                onSave={handleSaveSection}
              >
                {editingSection === "guidedPractice" ? (
                  <Textarea
                    value={editedLesson.guidedPractice.activities.join("\n")}
                    onChange={(e) =>
                      updateSection(["guidedPractice", "activities"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[100px]"
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {editedLesson.guidedPractice.activities.map((activity, i) => (
                      <li key={i} className="text-sm">{activity}</li>
                    ))}
                  </ul>
                )}
              </Section>

              <Separator />

              {/* Independent Practice Section */}
              <Section
                title={`Independent Practice (${editedLesson.independentPractice.minutes} minutes)`}
                isEditing={editingSection === "independentPractice"}
                onEdit={() => handleEdit("independentPractice")}
                onSave={handleSaveSection}
              >
                {editingSection === "independentPractice" ? (
                  <Textarea
                    value={editedLesson.independentPractice.choices.join("\n")}
                    onChange={(e) =>
                      updateSection(["independentPractice", "choices"], e.target.value.split("\n").filter(Boolean))
                    }
                    className="min-h-[100px]"
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {editedLesson.independentPractice.choices.map((choice, i) => (
                      <li key={i} className="text-sm">{choice}</li>
                    ))}
                  </ul>
                )}
              </Section>

              <Separator />

              {/* Differentiation Section */}
              <Section
                title="Differentiation Strategies"
                isEditing={editingSection === "differentiation"}
                onEdit={() => handleEdit("differentiation")}
                onSave={handleSaveSection}
              >
                {editingSection === "differentiation" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Struggling Learners:</label>
                      <Textarea
                        value={editedLesson.differentiation.struggling.join("\n")}
                        onChange={(e) =>
                          updateSection(["differentiation", "struggling"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[80px] mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">On-Level Learners:</label>
                      <Textarea
                        value={editedLesson.differentiation.onLevel.join("\n")}
                        onChange={(e) =>
                          updateSection(["differentiation", "onLevel"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[80px] mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Advanced Learners:</label>
                      <Textarea
                        value={editedLesson.differentiation.advanced.join("\n")}
                        onChange={(e) =>
                          updateSection(["differentiation", "advanced"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[80px] mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Struggling Learners:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {editedLesson.differentiation.struggling.map((item, i) => (
                          <li key={i} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">On-Level Learners:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {editedLesson.differentiation.onLevel.map((item, i) => (
                          <li key={i} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Advanced Learners:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {editedLesson.differentiation.advanced.map((item, i) => (
                          <li key={i} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Section>

              <Separator />

              {/* Assessment Section */}
              <Section
                title="Formative Assessment"
                isEditing={editingSection === "formativeAssessment"}
                onEdit={() => handleEdit("formativeAssessment")}
                onSave={handleSaveSection}
              >
                {editingSection === "formativeAssessment" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Methods:</label>
                      <Textarea
                        value={editedLesson.formativeAssessment.methods.join("\n")}
                        onChange={(e) =>
                          updateSection(["formativeAssessment", "methods"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[80px] mt-1"
                      />
                    </div>
                    {editedLesson.formativeAssessment.exitTicket && (
                      <div>
                        <label className="text-sm font-medium">Exit Ticket:</label>
                        <Textarea
                          value={editedLesson.formativeAssessment.exitTicket}
                          onChange={(e) =>
                            updateSection(["formativeAssessment", "exitTicket"], e.target.value)
                          }
                          className="min-h-[60px] mt-1"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Methods:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {editedLesson.formativeAssessment.methods.map((method, i) => (
                          <li key={i} className="text-sm">{method}</li>
                        ))}
                      </ul>
                    </div>
                    {editedLesson.formativeAssessment.exitTicket && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Exit Ticket:</h4>
                        <p className="text-sm italic ml-2">{editedLesson.formativeAssessment.exitTicket}</p>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* Teacher Notes */}
              {editedLesson.teacherNotes && editedLesson.teacherNotes.length > 0 && (
                <>
                  <Separator />
                  <Section
                    title="Teacher Notes"
                    isEditing={editingSection === "teacherNotes"}
                    onEdit={() => handleEdit("teacherNotes")}
                    onSave={handleSaveSection}
                  >
                    {editingSection === "teacherNotes" ? (
                      <Textarea
                        value={editedLesson.teacherNotes?.join("\n") || ""}
                        onChange={(e) =>
                          updateSection(["teacherNotes"], e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[100px]"
                      />
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {editedLesson.teacherNotes?.map((note, i) => (
                          <li key={i} className="text-sm">{note}</li>
                        ))}
                      </ul>
                    )}
                  </Section>
                </>
              )}
            </div>
          </ScrollArea>

          <div className="mt-6 flex flex-wrap gap-3 items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={handleSaveLesson} disabled={isSaving} aria-label="Save lesson to library">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Lesson"}
              </Button>
              <Button variant="outline" onClick={onRegenerate} aria-label="Generate a new version of this lesson">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Again
              </Button>
              <Button variant="ghost" onClick={onBack} aria-label="Go back to edit parameters">
                Back
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Powered by TailorEDU AI</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SectionProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

function Section({ title, isEditing, onEdit, onSave, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isEditing ? (
          <Button
            size="sm"
            variant="default"
            onClick={onSave}
            aria-label={`Save changes to ${title}`}
          >
            <Check className="h-4 w-4 mr-1" />
            Done
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Edit ${title} section`}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
