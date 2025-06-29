
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Settings,
  Clock
} from 'lucide-react';

const AdminNotifications = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'System Maintenance Required',
      message: 'Scheduled maintenance window needed for database optimization',
      timestamp: '2024-01-15T10:30:00Z',
      category: 'system',
      read: false,
      actionRequired: true
    },
    {
      id: 2,
      type: 'info',
      title: 'New Student Enrollment',
      message: '25 new students enrolled at Hope Academy',
      timestamp: '2024-01-15T09:15:00Z',
      category: 'enrollment',
      read: false,
      actionRequired: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Curriculum Update Available',
      message: 'Excel course curriculum v2.3 is ready for deployment',
      timestamp: '2024-01-15T08:45:00Z',
      category: 'curriculum',
      read: true,
      actionRequired: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Weekly Report Generated',
      message: 'Q1 2024 progress report has been successfully generated',
      timestamp: '2024-01-15T07:00:00Z',
      category: 'reports',
      read: true,
      actionRequired: false
    },
    {
      id: 5,
      type: 'warning',
      title: 'Teacher Support Request',
      message: 'Sarah Johnson requested help with grading system',
      timestamp: '2024-01-14T16:20:00Z',
      category: 'support',
      read: false,
      actionRequired: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'enrollment':
        return <Users className="h-4 w-4" />;
      case 'curriculum':
        return <BookOpen className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'urgent') return notification.type === 'urgent';
    if (filter === 'action') return notification.actionRequired;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent').length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  return (
    <div className="space-y-6">
      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">
              High priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">
              Need action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications Center
          </CardTitle>
          <CardDescription>
            Real-time alerts and system notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgentCount})</TabsTrigger>
              <TabsTrigger value="action">Action Required ({actionRequiredCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{notification.title}</h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            {notification.actionRequired && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getCategoryIcon(notification.category)}
                            <span className="capitalize">{notification.category}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>
                              {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button variant="outline" size="sm">
                              Mark Read
                            </Button>
                          )}
                          {notification.actionRequired && (
                            <Button size="sm">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
