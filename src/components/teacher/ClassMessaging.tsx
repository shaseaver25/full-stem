
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, Pin, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClassMessage, getClassMessages, ClassMessage } from '@/services/messagingService';

interface ClassMessagingProps {
  classId: string;
}

export const ClassMessaging = ({ classId }: ClassMessagingProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ClassMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    messageType: 'general' as 'announcement' | 'general' | 'urgent',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    isPinned: false,
  });

  useEffect(() => {
    fetchMessages();
  }, [classId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    const result = await getClassMessages(classId);
    if (result.success) {
      setMessages(result.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const result = await createClassMessage({
      classId,
      title: newMessage.title,
      content: newMessage.content,
      messageType: newMessage.messageType,
      priority: newMessage.priority,
      isPinned: newMessage.isPinned,
    });

    if (result.success) {
      toast({
        title: "Message sent!",
        description: "Your message has been posted to the class.",
      });
      setNewMessage({
        title: '',
        content: '',
        messageType: 'general',
        priority: 'normal',
        isPinned: false,
      });
      fetchMessages();
    } else {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
    setIsSending(false);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Class Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message-title">Title</Label>
            <Input
              id="message-title"
              value={newMessage.title}
              onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Message title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="message-type">Type</Label>
              <Select
                value={newMessage.messageType}
                onValueChange={(value: 'announcement' | 'general' | 'urgent') => 
                  setNewMessage(prev => ({ ...prev, messageType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message-priority">Priority</Label>
              <Select
                value={newMessage.priority}
                onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                  setNewMessage(prev => ({ ...prev, priority: value }))
                }
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
          </div>

          <div>
            <Label htmlFor="message-content">Content</Label>
            <Textarea
              id="message-content"
              value={newMessage.content}
              onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Type your message..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="pin-message"
              checked={newMessage.isPinned}
              onCheckedChange={(checked) => setNewMessage(prev => ({ ...prev, isPinned: checked }))}
            />
            <Label htmlFor="pin-message" className="flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pin this message
            </Label>
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={isSending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No messages yet</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{message.title}</h3>
                      {message.is_pinned && <Pin className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(message.priority)}
                      <Badge className={getMessageTypeColor(message.message_type)}>
                        {message.message_type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{message.content}</p>
                  <div className="text-xs text-gray-500">
                    Sent: {new Date(message.sent_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
