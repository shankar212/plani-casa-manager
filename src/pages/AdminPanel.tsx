import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type UserRole = 'admin' | 'customer' | 'collaborator';

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: UserRole[];
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch all profiles with user IDs (which match auth.users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data - use profile ID as email placeholder
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const roles = userRoles
          ?.filter(r => r.user_id === profile.id)
          .map(r => r.role as UserRole) || [];

        return {
          id: profile.id,
          email: `User ID: ${profile.id.substring(0, 8)}...`,
          full_name: profile.full_name,
          roles,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, role: UserRole, currentlyHasRole: boolean) => {
    try {
      setUpdating(userId);

      if (currentlyHasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;

        toast({
          title: 'Role removed',
          description: `${role} role has been removed from the user.`,
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;

        toast({
          title: 'Role assigned',
          description: `${role} role has been assigned to the user.`,
        });
      }

      // Refresh users
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'customer':
        return <User className="h-3 w-3" />;
      case 'collaborator':
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'customer':
        return 'secondary';
      case 'collaborator':
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Assign roles to users. Users can have multiple roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Current Roles</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Customer</TableHead>
                    <TableHead className="text-center">Collaborator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'Unnamed User'}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {user.id.substring(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.length === 0 ? (
                              <span className="text-sm text-muted-foreground">No roles</span>
                            ) : (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant={getRoleBadgeVariant(role)}
                                  className="gap-1"
                                >
                                  {getRoleIcon(role)}
                                  {role}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={user.roles.includes('admin')}
                            disabled={updating === user.id}
                            onCheckedChange={() =>
                              toggleRole(user.id, 'admin', user.roles.includes('admin'))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={user.roles.includes('customer')}
                            disabled={updating === user.id}
                            onCheckedChange={() =>
                              toggleRole(user.id, 'customer', user.roles.includes('customer'))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={user.roles.includes('collaborator')}
                            disabled={updating === user.id}
                            onCheckedChange={() =>
                              toggleRole(user.id, 'collaborator', user.roles.includes('collaborator'))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-sm">Role Descriptions:</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                  <span>Full control over all users, projects, and access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    Customer
                  </Badge>
                  <span>Can create and manage own projects, and share them with others</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    Collaborator
                  </Badge>
                  <span>Works only on shared projects</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
