
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Mail, MailOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createDirectMessage, getDirectMessages, DirectMessage, markMessageAsRead } from '@/services/messagingService';

interface DirectMessagingProps {
  recipientId?: string;
  classId?: string;
}

export const DirectMessaging = ({ recipientId, classId }: DirectMessagingProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchMessages();
  }, [recipientId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    const result = await getDirectMessages(recipientId);
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
    if (!recipientId) {
      toast({
        title: "No recipient",
        description: "Please select a recipient first.",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please provide message content.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const result = await createDirectMessage({
      recipientId,
      classId,
      subject: newMessage.subject,
      content: newMessage.content,
    });

    if (result.success) {
      toast({
        title: "Message sent!",
        description: "Your message has been delivered.",
      });
      setNewMessage({ subject: '', content: '' });
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

  const handleMarkAsRead = async (messageId: string) => {
    const result = await markMessageAsRead(messageId);
    if (result.success) {
      fetchMessages();
    }
  };

  return (
    <div className="space-y-6">
      {recipientId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              New Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message-subject">Subject (optional)</Label>
              <Input
                id="message-subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject..."
              />
            </div>

            <div>
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message..."
                rows={4}
              />
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
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
                    <div>
                      {message.subject && (
                        <h3 className="font-semibold">{message.subject}</h3>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>From: {message.sender_id}</span>
                        <span>•</span>
                        <span>{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!message.is_read ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Unread
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MailOpen className="h-3 w-3" />
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{message.content}</p>
                  {!message.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
