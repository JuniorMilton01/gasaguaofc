import { useState } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  Printer, 
  Save,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { Configuracoes, Usuario } from '@/types';

interface ConfiguracoesProps {
  configuracoes: Configuracoes;
  usuarios: Usuario[];
  usuarioLogado: Usuario | null;
  onUpdateConfiguracoes: (dados: Partial<Configuracoes>) => void;
  onAddUsuario: (usuario: any) => void;
  onUpdateUsuario: (id: string, dados: Partial<Usuario>) => void;
  onDeleteUsuario: (id: string) => void;
}

export function ConfiguracoesSection({ 
  configuracoes, 
  usuarios, 
  usuarioLogado,
  onUpdateConfiguracoes,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario
}: ConfiguracoesProps) {
  const [formConfig, setFormConfig] = useState(configuracoes);
  const [dialogUsuario, setDialogUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [formUsuario, setFormUsuario] = useState<{
    nome: string;
    login: string;
    senha: string;
    perfil: 'admin' | 'operador';
  }>({
    nome: '',
    login: '',
    senha: '',
    perfil: 'operador',
  });

  const handleSalvarConfiguracoes = () => {
    onUpdateConfiguracoes(formConfig);
    alert('Configurações salvas com sucesso!');
  };

  const handleSubmitUsuario = () => {
    if (usuarioEditando) {
      onUpdateUsuario(usuarioEditando.id, {
        nome: formUsuario.nome,
        login: formUsuario.login,
        perfil: formUsuario.perfil,
        ...(formUsuario.senha ? { senha: formUsuario.senha } : {}),
      });
    } else {
      onAddUsuario({
        nome: formUsuario.nome,
        login: formUsuario.login,
        senha: formUsuario.senha,
        perfil: formUsuario.perfil,
      });
    }

    setDialogUsuario(false);
    setUsuarioEditando(null);
    setFormUsuario({ nome: '', login: '', senha: '', perfil: 'operador' });
  };

  const editarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nome: usuario.nome,
      login: usuario.login,
      senha: '',
      perfil: usuario.perfil,
    });
    setDialogUsuario(true);
  };

  const isAdmin = usuarioLogado?.perfil === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empresa">
            <Building2 className="w-4 h-4 mr-1" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="sistema">
            <Settings className="w-4 h-4 mr-1" />
            Sistema
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="usuarios">
              <User className="w-4 h-4 mr-1" />
              Usuários
            </TabsTrigger>
          )}
        </TabsList>

        {/* Aba Empresa */}
        <TabsContent value="empresa" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={formConfig.nomeEmpresa}
                    onChange={(e) => setFormConfig({ ...formConfig, nomeEmpresa: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={formConfig.cnpj}
                    onChange={(e) => setFormConfig({ ...formConfig, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formConfig.telefone}
                    onChange={(e) => setFormConfig({ ...formConfig, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formConfig.email}
                    onChange={(e) => setFormConfig({ ...formConfig, email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={formConfig.endereco.rua}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, rua: e.target.value }
                      })}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={formConfig.endereco.numero}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, numero: e.target.value }
                      })}
                      placeholder="Nº"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      value={formConfig.endereco.complemento}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, complemento: e.target.value }
                      })}
                      placeholder="Sala, Andar..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input
                      value={formConfig.endereco.bairro}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, bairro: e.target.value }
                      })}
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={formConfig.endereco.cep}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, cep: e.target.value }
                      })}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={formConfig.endereco.cidade}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, cidade: e.target.value }
                      })}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      value={formConfig.endereco.estado}
                      onChange={(e) => setFormConfig({ 
                        ...formConfig, 
                        endereco: { ...formConfig.endereco, estado: e.target.value }
                      })}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSalvarConfiguracoes} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="sistema" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Impressão Automática
                  </Label>
                  <p className="text-sm text-gray-500">Imprimir recibo automaticamente após cada venda</p>
                </div>
                <Switch
                  checked={formConfig.imprimirAutomatico}
                  onCheckedChange={(v) => setFormConfig({ ...formConfig, imprimirAutomatico: v })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alerta de Estoque Mínimo
                </Label>
                <p className="text-sm text-gray-500">
                  Quantidade mínima para alertar sobre estoque baixo
                </p>
                <Input
                  type="number"
                  min="1"
                  value={formConfig.estoqueMinimoAlerta}
                  onChange={(e) => setFormConfig({ 
                    ...formConfig, 
                    estoqueMinimoAlerta: parseInt(e.target.value) || 5
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Mensagem do Recibo</Label>
                <p className="text-sm text-gray-500">
                  Mensagem que aparece no final dos recibos
                </p>
                <Input
                  value={formConfig.mensagemRecibo}
                  onChange={(e) => setFormConfig({ ...formConfig, mensagemRecibo: e.target.value })}
                  placeholder="Obrigado pela preferência!"
                />
              </div>

              <Button onClick={handleSalvarConfiguracoes} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Usuários */}
        {isAdmin && (
          <TabsContent value="usuarios" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Gerenciar Usuários
                </CardTitle>
                <Button onClick={() => {
                  setUsuarioEditando(null);
                  setFormUsuario({ nome: '', login: '', senha: '', perfil: 'operador' });
                  setDialogUsuario(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usuarios.map(usuario => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-gray-500">{usuario.login}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={usuario.perfil === 'admin' ? 'default' : 'secondary'}>
                          {usuario.perfil === 'admin' ? 'Administrador' : 'Operador'}
                        </Badge>
                        {usuario.id !== usuarioLogado?.id && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => editarUsuario(usuario)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500"
                              onClick={() => {
                                if (confirm('Deseja realmente excluir este usuário?')) {
                                  onDeleteUsuario(usuario.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog Usuário */}
      <Dialog open={dialogUsuario} onOpenChange={setDialogUsuario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formUsuario.nome}
                onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Login</Label>
              <Input
                value={formUsuario.login}
                onChange={(e) => setFormUsuario({ ...formUsuario, login: e.target.value })}
                placeholder="Nome de usuário"
              />
            </div>
            <div className="space-y-2">
              <Label>{usuarioEditando ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</Label>
              <Input
                type="password"
                value={formUsuario.senha}
                onChange={(e) => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formUsuario.perfil === 'operador' ? 'default' : 'outline'}
                  onClick={() => setFormUsuario({ ...formUsuario, perfil: 'operador' })}
                  className="flex-1"
                >
                  Operador
                </Button>
                <Button
                  type="button"
                  variant={formUsuario.perfil === 'admin' ? 'default' : 'outline'}
                  onClick={() => setFormUsuario({ ...formUsuario, perfil: 'admin' as const })}
                  className="flex-1"
                >
                  Administrador
                </Button>
              </div>
            </div>
            <Button onClick={handleSubmitUsuario} className="w-full">
              {usuarioEditando ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
