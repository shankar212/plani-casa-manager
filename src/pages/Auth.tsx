import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInSchema, signUpSchema, resetPasswordSchema } from '@/lib/validationSchemas';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = () => {
  const { user, signIn, signUp, loading, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate input
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate input
    const result = signUpSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    // Validate input
    const result = resetPasswordSchema.safeParse({ email: resetEmail });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setIsResetting(false);
      return;
    }

    const { error } = await resetPassword(resetEmail);
    if (!error) {
      setIsResetDialogOpen(false);
      setResetEmail('');
    }
    setIsResetting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-border/50 backdrop-blur-sm bg-card/95 relative z-10 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 transition-transform duration-300 hover:scale-110">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Plani
            </h1>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription className="text-base">
              Gerencie seus projetos de construção com eficiência
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger value="signin" className="data-[state=active]:shadow-md">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:shadow-md">
                Criar Conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-5 mt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="link" 
                      className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                      type="button"
                    >
                      Esqueceu sua senha?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-xl">Recuperar Senha</DialogTitle>
                      <DialogDescription>
                        Digite seu email para receber um link de recuperação de senha
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-11 font-medium"
                        disabled={isResetting}
                      >
                        {isResetting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Enviar Link'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-5 mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password-signup"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    A senha deve ter no mínimo 6 caracteres
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;