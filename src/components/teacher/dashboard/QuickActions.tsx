import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, FolderPlus } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Send Message',
      description: 'Contact students or parents',
      icon: Mail,
      href: '/teacher/messages',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Add Content',
      description: 'Upload to content library',
      icon: FolderPlus,
      href: '/content',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isComingSoon = action.title === 'Send Message';
            
            if (isComingSoon) {
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start h-auto py-4 cursor-not-allowed opacity-75"
                  disabled
                >
                  <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{action.title}</span>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </Button>
              );
            }
            
            return (
              <Link key={action.title} to={action.href}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{action.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
