
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  message: string;
  sender_type: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  teacher_name: string;
  student_name: string;
}

interface MessagesListProps {
  messages: Message[];
}

const MessagesList: React.FC<MessagesListProps> = ({ messages }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Teacher Communications
        </CardTitle>
        <CardDescription>
          Messages and updates from your child's teachers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={!message.is_read ? 'border-blue-200' : ''}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{message.subject}</h4>
                      <Badge variant={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      {!message.is_read && (
                        <Badge variant="default">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      From: {message.teacher_name} • Re: {message.student_name}
                    </p>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
