import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Flame, Droplets } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginProps {
  onLogin: (login: string, senha: string) => boolean;
}

export function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!login || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    const sucesso = onLogin(login, senha);
    if (!sucesso) {
      setErro('Login ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            GasAgua Pro
          </CardTitle>
          <CardDescription className="text-lg">
            Sistema de Gestão para Distribuidoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login">Usuário</Label>
              <Input
                id="login"
                type="text"
                placeholder="Digite seu usuário"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Usuário padrão: admin / Senha: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
