
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

interface MessageComposerProps {
  selectedStudent: Student | null;
  onSendMessage: (messageData: {
    subject: string;
    message: string;
    priority: string;
    student_id: string;
  }) => Promise<void>;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ selectedStudent, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  const handleSendMessage = async () => {
    if (!selectedStudent) return;
    
    await onSendMessage({
      subject: messageForm.subject,
      message: messageForm.message,
      priority: messageForm.priority,
      student_id: selectedStudent.id
    });
    
    setIsOpen(false);
    setMessageForm({ subject: '', message: '', priority: 'normal' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          Message Teacher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message to Teacher</DialogTitle>
          <DialogDescription>
            {selectedStudent && `Regarding ${selectedStudent.first_name} ${selectedStudent.last_name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={messageForm.subject}
              onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Message subject"
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={messageForm.priority}
              onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={messageForm.message}
              onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Type your message here..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposer;
