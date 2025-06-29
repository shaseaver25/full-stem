
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Send, CheckCircle, Clock } from 'lucide-react';
import { getMyClasses, publishClass, SavedClass } from '@/services/classService';
import { useToast } from '@/hooks/use-toast';

const ClassPublishingPanel = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<SavedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingClass, setPublishingClass] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const result = await getMyClasses();
    if (result.success && result.data) {
      setClasses(result.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePublishClass = async (classId: string) => {
    setPublishingClass(classId);
    const result = await publishClass(classId);
    
    if (result.success) {
      toast({
        title: "Success!",
        description: "Class published successfully.",
      });
      // Update the local state
      setClasses(classes.map(cls => 
        cls.id === classId ? { ...cls, published: true } : cls
      ));
    } else {
      toast({
        title: "Error",
        description: "Failed to publish class.",
        variant: "destructive",
      });
    }
    setPublishingClass(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading classes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Class Publishing Panel
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage and publish classes to make them available to teachers
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes created yet
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">
                      {classItem.subject} • Grade {classItem.grade_level}
                    </p>
                    {classItem.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        {classItem.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={classItem.published ? "default" : "secondary"}>
                      {classItem.published ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  {!classItem.published && (
                    <Button 
                      size="sm"
                      onClick={() => handlePublishClass(classItem.id)}
                      disabled={publishingClass === classItem.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {publishingClass === classItem.id ? 'Publishing...' : 'Publish'}
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(classItem.created_at).toLocaleDateString()}
                  {classItem.updated_at !== classItem.created_at && (
                    <> • Updated: {new Date(classItem.updated_at).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassPublishingPanel;
