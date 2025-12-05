import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Users, Building2 } from "lucide-react";
import { AnimatedBreadcrumbs } from "@/components/AnimatedBreadcrumbs";

interface UserProfile {
    id: string;
    full_name: string | null;
    company_name: string | null;
    max_projects: number;
    project_count: number;
    email?: string;
}

const AdminDashboard = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(3);

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*");

            if (profilesError) throw profilesError;

            // Fetch project counts
            const { data: projects, error: projectsError } = await supabase
                .from("projects")
                .select("user_id");

            if (projectsError) throw projectsError;

            // Calculate counts
            const counts = projects.reduce((acc: Record<string, number>, project) => {
                acc[project.user_id] = (acc[project.user_id] || 0) + 1;
                return acc;
            }, {});

            // Combine data
            // Note: In a real app, we'd want to fetch emails too, but that requires admin API access
            // or a specific view. For now, we'll use profile data.
            return profiles.map((profile) => ({
                ...profile,
                project_count: counts[profile.id] || 0,
                // Default max_projects if null (though SQL default should handle this)
                max_projects: profile.max_projects ?? 3
            })) as UserProfile[];
        },
    });

    const updateLimitMutation = useMutation({
        mutationFn: async ({ userId, limit }: { userId: string; limit: number }) => {
            const { error } = await supabase
                .from("profiles")
                .update({ max_projects: limit })
                .eq("id", userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setEditingId(null);
            toast({
                title: "Limite atualizado",
                description: "O limite de projetos do usuário foi atualizado com sucesso.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível atualizar o limite. Verifique suas permissões.",
                variant: "destructive",
            });
            console.error(error);
        },
    });

    const handleEdit = (user: UserProfile) => {
        setEditingId(user.id);
        setEditValue(user.max_projects);
    };

    const handleSave = (userId: string) => {
        updateLimitMutation.mutate({ userId, limit: editValue });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-8">
                <AnimatedBreadcrumbs />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                        <p className="text-muted-foreground">
                            Gerencie usuários e limites do sistema
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Usuários
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users?.length || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Projetos
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {users?.reduce((acc, user) => acc + user.project_count, 0) || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gerenciamento de Usuários</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Projetos Ativos</TableHead>
                                    <TableHead>Limite de Projetos</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name || "Sem nome"}
                                        </TableCell>
                                        <TableCell>{user.company_name || "-"}</TableCell>
                                        <TableCell>
                                            <span className={user.project_count >= user.max_projects ? "text-red-500 font-bold" : ""}>
                                                {user.project_count}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {editingId === user.id ? (
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(parseInt(e.target.value))}
                                                    className="w-20"
                                                    min={0}
                                                />
                                            ) : (
                                                user.max_projects
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === user.id ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(user.id)}
                                                    disabled={updateLimitMutation.isPending}
                                                >
                                                    {updateLimitMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Editar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
