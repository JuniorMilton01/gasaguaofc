import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  DollarSign,
  History,
  CreditCard,
  Brain,
  AlertTriangle,
  Package,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Cliente, Venda } from '@/types';

interface ClientesProps {
  clientes: Cliente[];
  vendas: Venda[];
  onAddCliente: (cliente: any) => void;
  onUpdateCliente: (id: string, dados: Partial<Cliente>) => void;
  onDeleteCliente: (id: string) => void;
  onQuitarFiado: (clienteId: string, valor: number) => void;
  analisarConsumoCliente?: (clienteId: string, vendas: Venda[]) => any;
}

export function ClientesSection({ 
  clientes, 
  vendas, 
  onAddCliente, 
  onUpdateCliente, 
  onDeleteCliente,
  onQuitarFiado,
  analisarConsumoCliente 
}: ClientesProps) {
  const [busca, setBusca] = useState('');
  const [dialogCliente, setDialogCliente] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [valorPagamento, setValorPagamento] = useState('');

  const [formCliente, setFormCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpfCnpj: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
    observacoes: '',
    limiteCredito: '',
  });

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca) ||
    c.cpfCnpj?.includes(busca)
  );

  const clientesFiado = clientes.filter(c => c.saldoDevedor > 0);

  const handleSubmitCliente = () => {
    const cliente = {
      nome: formCliente.nome,
      telefone: formCliente.telefone,
      email: formCliente.email,
      cpfCnpj: formCliente.cpfCnpj,
      endereco: {
        rua: formCliente.rua,
        numero: formCliente.numero,
        bairro: formCliente.bairro,
        cidade: formCliente.cidade,
        estado: formCliente.estado,
        cep: formCliente.cep,
        complemento: formCliente.complemento,
      },
      observacoes: formCliente.observacoes,
      limiteCredito: parseFloat(formCliente.limiteCredito) || undefined,
    };

    if (clienteSelecionado) {
      onUpdateCliente(clienteSelecionado.id, cliente);
    } else {
      onAddCliente(cliente);
    }

    setDialogCliente(false);
    setClienteSelecionado(null);
    limparFormulario();
  };

  const limparFormulario = () => {
    setFormCliente({
      nome: '',
      telefone: '',
      email: '',
      cpfCnpj: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: '',
      observacoes: '',
      limiteCredito: '',
    });
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setFormCliente({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || '',
      cpfCnpj: cliente.cpfCnpj || '',
      rua: cliente.endereco?.rua || '',
      numero: cliente.endereco?.numero || '',
      bairro: cliente.endereco?.bairro || '',
      cidade: cliente.endereco?.cidade || '',
      estado: cliente.endereco?.estado || '',
      cep: cliente.endereco?.cep || '',
      complemento: cliente.endereco?.complemento || '',
      observacoes: cliente.observacoes || '',
      limiteCredito: cliente.limiteCredito?.toString() || '',
    });
    setDialogCliente(true);
  };

  const verDetalhes = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setDialogDetalhes(true);
  };

  const abrirPagamento = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setValorPagamento(cliente.saldoDevedor.toString());
    setDialogPagamento(true);
  };

  const handlePagamento = () => {
    if (!clienteSelecionado) return;
    const valor = parseFloat(valorPagamento);
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor válido');
      return;
    }
    if (valor > clienteSelecionado.saldoDevedor) {
      alert('Valor maior que o saldo devedor');
      return;
    }
    onQuitarFiado(clienteSelecionado.id, valor);
    setDialogPagamento(false);
    setValorPagamento('');
  };

  const getVendasCliente = (clienteId: string) => {
    return vendas.filter(v => v.clienteId === clienteId && v.status === 'concluida')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Cadastro de Clientes</h1>
        <Button onClick={() => {
          setClienteSelecionado(null);
          limparFormulario();
          setDialogCliente(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Clientes</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Clientes com Fiado</CardTitle>
            <CreditCard className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{clientesFiado.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total em Fiado</CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              R$ {clientesFiado.reduce((acc, c) => acc + c.saldoDevedor, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar cliente por nome, telefone ou CPF/CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="todos">
            <Users className="w-4 h-4 mr-1" />
            Todos ({clientes.length})
          </TabsTrigger>
          <TabsTrigger value="fiado">
            <CreditCard className="w-4 h-4 mr-1" />
            Fiado ({clientesFiado.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesFiltrados.map(cliente => (
              <Card key={cliente.id} className={cliente.saldoDevedor > 0 ? 'border-orange-300' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {cliente.telefone}
                        </p>
                      </div>
                    </div>
                    {cliente.saldoDevedor > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Fiado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {cliente.endereco?.rua && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cliente.endereco.bairro}, {cliente.endereco.cidade}
                      </p>
                    )}
                    {cliente.ultimaCompra && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Última compra: {new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {cliente.mediaConsumoDias && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Média: {cliente.mediaConsumoDias.toFixed(0)} dias
                      </p>
                    )}
                  </div>

                  {cliente.saldoDevedor > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        Saldo devedor: <strong>R$ {cliente.saldoDevedor.toFixed(2)}</strong>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => verDetalhes(cliente)}
                    >
                      <History className="w-4 h-4 mr-1" />
                      Histórico
                    </Button>
                    {cliente.saldoDevedor > 0 && (
                      <Button 
                        variant="default" 
                        size="sm"
                        className="flex-1"
                        onClick={() => abrirPagamento(cliente)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Receber
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => editarCliente(cliente)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500"
                      onClick={() => {
                        if (confirm('Deseja realmente excluir este cliente?')) {
                          onDeleteCliente(cliente.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fiado" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesFiado.map(cliente => (
              <Card key={cliente.id} className="border-orange-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        <p className="text-sm text-gray-500">{cliente.telefone}</p>
                      </div>
                    </div>
                    <Badge variant="destructive">Fiado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-orange-50 rounded-lg mb-4">
                    <p className="text-sm text-orange-800 mb-1">Saldo Devedor</p>
                    <p className="text-2xl font-bold text-orange-700">
                      R$ {cliente.saldoDevedor.toFixed(2)}
                    </p>
                    {cliente.limiteCredito && (
                      <p className="text-xs text-orange-600 mt-1">
                        Limite: R$ {cliente.limiteCredito.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => verDetalhes(cliente)}
                    >
                      <History className="w-4 h-4 mr-1" />
                      Histórico
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => abrirPagamento(cliente)}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Receber
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Cliente */}
      <Dialog open={dialogCliente} onOpenChange={setDialogCliente}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {clienteSelecionado ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formCliente.nome}
                onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone *</Label>
                <Input
                  value={formCliente.telefone}
                  onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  value={formCliente.cpfCnpj}
                  onChange={(e) => setFormCliente({ ...formCliente, cpfCnpj: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formCliente.email}
                onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Limite de Crédito</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formCliente.limiteCredito}
                  onChange={(e) => setFormCliente({ ...formCliente, limiteCredito: e.target.value })}
                  className="pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Endereço</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Rua</Label>
                  <Input
                    value={formCliente.rua}
                    onChange={(e) => setFormCliente({ ...formCliente, rua: e.target.value })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={formCliente.numero}
                    onChange={(e) => setFormCliente({ ...formCliente, numero: e.target.value })}
                    placeholder="Nº"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={formCliente.complemento}
                    onChange={(e) => setFormCliente({ ...formCliente, complemento: e.target.value })}
                    placeholder="Apto, Bloco..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={formCliente.bairro}
                    onChange={(e) => setFormCliente({ ...formCliente, bairro: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formCliente.cep}
                    onChange={(e) => setFormCliente({ ...formCliente, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formCliente.cidade}
                    onChange={(e) => setFormCliente({ ...formCliente, cidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={formCliente.estado}
                    onChange={(e) => setFormCliente({ ...formCliente, estado: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={formCliente.observacoes}
                onChange={(e) => setFormCliente({ ...formCliente, observacoes: e.target.value })}
                placeholder="Observações sobre o cliente"
              />
            </div>

            <Button onClick={handleSubmitCliente} className="w-full">
              {clienteSelecionado ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histórico do Cliente</DialogTitle>
          </DialogHeader>
          {clienteSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{clienteSelecionado.nome}</h3>
                  <p className="text-gray-500">{clienteSelecionado.telefone}</p>
                  {clienteSelecionado.saldoDevedor > 0 && (
                    <p className="text-orange-600 font-medium">
                      Saldo devedor: R$ {clienteSelecionado.saldoDevedor.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Total de Compras</p>
                  <p className="text-xl font-bold">{clienteSelecionado.historicoPedidos.length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Total Gasto</p>
                  <p className="text-xl font-bold">
                    R$ {clienteSelecionado.historicoPedidos.reduce((acc, p) => acc + p.valorTotal, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Média Consumo</p>
                  <p className="text-xl font-bold">
                    {clienteSelecionado.mediaConsumoDias ? `${clienteSelecionado.mediaConsumoDias.toFixed(0)} dias` : '-'}
                  </p>
                </div>
              </div>

              {/* Análise Inteligente */}
              {analisarConsumoCliente && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Análise Inteligente
                  </h4>
                  {(() => {
                    const analise = analisarConsumoCliente(clienteSelecionado.id, vendas);
                    if (!analise) return <p className="text-gray-500">Sem dados suficientes para análise</p>;
                    
                    return (
                      <div className="space-y-4">
                        {/* Alerta de Inatividade */}
                        {analise.alertaInatividade && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="font-medium text-red-800">Cliente Inativo!</p>
                              <p className="text-sm text-red-600">
                                Passou {Math.round(analise.frequenciaDias * 2)} dias sem comprar.
                                Média normal: {analise.frequenciaDias} dias.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Previsão Próxima Compra */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Frequência Média
                            </p>
                            <p className="text-xl font-bold">{analise.frequenciaDias} dias</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Próxima Compra Prevista
                            </p>
                            <p className="text-xl font-bold">
                              {new Date(analise.previsaoProximaCompra).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Produtos Mais Comprados */}
                        <div>
                          <p className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Produtos Mais Comprados
                          </p>
                          <div className="space-y-2">
                            {analise.produtosMaisComprados.map((produto: any, idx: number) => (
                              <div key={produto.produtoId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>{produto.nome}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">{produto.quantidadeTotal}</span>
                                  <span className="text-xs text-gray-500"> unidades</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <h4 className="font-medium">Últimas Compras</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {getVendasCliente(clienteSelecionado.id).map(venda => (
                    <div key={venda.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{venda.codigo}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(venda.data).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {venda.valorTotal.toFixed(2)}
                          </p>
                          <Badge variant={venda.formaPagamento === 'fiado' ? 'destructive' : 'default'} className="text-xs">
                            {venda.formaPagamento === 'dinheiro' && 'Dinheiro'}
                            {venda.formaPagamento === 'cartao' && 'Cartão'}
                            {venda.formaPagamento === 'pix' && 'PIX'}
                            {venda.formaPagamento === 'fiado' && 'Fiado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {venda.itens.map(item => (
                          <span key={item.id} className="inline-block mr-3">
                            {item.quantidade}x {item.produto.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Pagamento */}
      <Dialog open={dialogPagamento} onOpenChange={setDialogPagamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receber Pagamento</DialogTitle>
          </DialogHeader>
          {clienteSelecionado && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">Cliente</p>
                <p className="text-lg font-bold">{clienteSelecionado.nome}</p>
                <p className="text-sm text-orange-600 mt-1">
                  Saldo devedor: <strong>R$ {clienteSelecionado.saldoDevedor.toFixed(2)}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Valor do Pagamento</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={clienteSelecionado.saldoDevedor}
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setDialogPagamento(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePagamento}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
