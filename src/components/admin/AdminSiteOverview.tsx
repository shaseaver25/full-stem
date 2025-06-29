
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, MapPin, Users, BookOpen, Plus } from 'lucide-react';

const AdminSiteOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in real app, this would come from your database
  const sites = [
    {
      id: 1,
      name: 'Hope Academy',
      location: 'Houston, TX',
      enrollment: 250,
      activeClasses: 12,
      status: 'active',
      type: 'pilot'
    },
    {
      id: 2,
      name: 'Genesys Works',
      location: 'Multiple Locations',
      enrollment: 180,
      activeClasses: 8,
      status: 'active',
      type: 'pilot'
    },
    {
      id: 3,
      name: 'Lincoln High School',
      location: 'Chicago, IL',
      enrollment: 420,
      activeClasses: 18,
      status: 'active',
      type: 'standard'
    },
    {
      id: 4,
      name: 'Roosevelt Middle School',
      location: 'Denver, CO',
      enrollment: 320,
      activeClasses: 15,
      status: 'inactive',
      type: 'standard'
    }
  ];

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEnrollment = sites.reduce((sum, site) => sum + site.enrollment, 0);
  const activeSites = sites.filter(site => site.status === 'active').length;
  const totalClasses = sites.reduce((sum, site) => sum + site.activeClasses, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSites} active sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollment}</div>
            <p className="text-xs text-muted-foreground">
              Across all sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pilot Programs</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Hope Academy, Genesys Works
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sites Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>School Sites</CardTitle>
              <CardDescription>
                Manage and monitor all enrolled school sites
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sites Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Active Classes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{site.location}</TableCell>
                  <TableCell>{site.enrollment}</TableCell>
                  <TableCell>{site.activeClasses}</TableCell>
                  <TableCell>
                    <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.type === 'pilot' ? 'outline' : 'secondary'}>
                      {site.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteOverview;
