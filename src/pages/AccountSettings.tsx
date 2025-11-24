import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AccountShareDialog } from "@/components/AccountShareDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Users, Mail, Building2, Save } from "lucide-react";
import { AnimatedBreadcrumbs } from "@/components/AnimatedBreadcrumbs";

export default function AccountSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setCompanyName(data.company_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          company_name: companyName
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <AnimatedBreadcrumbs />
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Configurações
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Minha <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Conta</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Gerencie suas informações pessoais e compartilhamentos
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Informações do Perfil</CardTitle>
              </div>
              <CardDescription>
                Atualize suas informações pessoais e de empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Nome da Empresa
                  </div>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nome da sua empresa (opcional)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={loading || saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Account Sharing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Compartilhamento de Conta</CardTitle>
              </div>
              <CardDescription>
                Compartilhe todos os seus projetos com outros usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ao compartilhar sua conta, o usuário terá acesso de visualização a todos os seus projetos (atuais e futuros).
                </p>
                <AccountShareDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
