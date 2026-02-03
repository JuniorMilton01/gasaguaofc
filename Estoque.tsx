import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Flame, 
  Droplets,
  RotateCcw,
  AlertTriangle,
  History,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Produto, MovimentacaoEstoque } from '@/types';

interface EstoqueProps {
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  onAddProduto: (produto: any) => void;
  onUpdateProduto: (id: string, dados: Partial<Produto>) => void;
  onDeleteProduto: (id: string) => void;
  onAddMovimentacao: (movimentacao: any) => void;
}

const tiposProduto = [
  { value: 'gas_cozinha', label: 'Gás de Cozinha' },
  { value: 'gas_empilhadeira', label: 'Gás de Empilhadeira' },
  { value: 'gas_industrial', label: 'Gás Industrial' },
  { value: 'agua_20l', label: 'Água 20L' },
  { value: 'agua_10l', label: 'Água 10L' },
  { value: 'agua_garrafinha', label: 'Água Garrafinha' },
  { value: 'outros', label: 'Outros' },
];

export function EstoqueSection({ 
  produtos, 
  movimentacoes, 
  onAddProduto, 
  onUpdateProduto, 
  onDeleteProduto,
  onAddMovimentacao 
}: EstoqueProps) {
  const [busca, setBusca] = useState('');
  const [dialogProduto, setDialogProduto] = useState(false);
  const [dialogMovimentacao, setDialogMovimentacao] = useState(false);
  const [dialogHistorico, setDialogHistorico] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoMovimentacao, setProdutoMovimentacao] = useState<Produto | null>(null);

  const [formProduto, setFormProduto] = useState<{
    codigo: string;
    nome: string;
    descricao: string;
    tipo: string;
    precoVenda: string;
    precoCusto: string;
    estoqueCheio: string;
    estoqueVazio: string;
    estoqueMinimo: string;
    unidade: string;
    retornaVazio: boolean;
    vendeCompleta: boolean;
    precoGalao: string;
  }>({
    codigo: '',
    nome: '',
    descricao: '',
    tipo: 'gas_cozinha',
    precoVenda: '',
    precoCusto: '',
    estoqueCheio: '',
    estoqueVazio: '',
    estoqueMinimo: '5',
    unidade: 'unidade',
    retornaVazio: true,
    vendeCompleta: false,
    precoGalao: '',
  });

  const [formMovimentacao, setFormMovimentacao] = useState<{
    tipo: 'entrada' | 'saida';
    quantidadeCheio: string;
    quantidadeVazio: string;
    motivo: string;
  }>({
    tipo: 'entrada',
    quantidadeCheio: '',
    quantidadeVazio: '',
    motivo: '',
  });

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  const estoqueBaixo = produtos.filter(p => p.estoqueCheio <= p.estoqueMinimo);

  const handleSubmitProduto = () => {
    const produto = {
      codigo: formProduto.codigo,
      nome: formProduto.nome,
      descricao: formProduto.descricao,
      tipo: formProduto.tipo as any,
      precoVenda: parseFloat(formProduto.precoVenda) || 0,
      precoCusto: parseFloat(formProduto.precoCusto) || 0,
      estoqueCheio: parseInt(formProduto.estoqueCheio) || 0,
      estoqueVazio: parseInt(formProduto.estoqueVazio) || 0,
      estoqueMinimo: parseInt(formProduto.estoqueMinimo) || 5,
      unidade: formProduto.unidade,
      retornaVazio: formProduto.retornaVazio,
      vendeCompleta: formProduto.vendeCompleta,
      precoGalao: formProduto.vendeCompleta ? parseFloat(formProduto.precoGalao) || 0 : undefined,
    };

    if (produtoEditando) {
      onUpdateProduto(produtoEditando.id, produto);
    } else {
      onAddProduto(produto);
    }

    setDialogProduto(false);
    setProdutoEditando(null);
    setFormProduto({
      codigo: '',
      nome: '',
      descricao: '',
      tipo: 'gas_cozinha',
      precoVenda: '',
      precoCusto: '',
      estoqueCheio: '',
      estoqueVazio: '',
      estoqueMinimo: '5',
      unidade: 'unidade',
      retornaVazio: true,
      vendeCompleta: false,
      precoGalao: '',
    });
  };

  const handleMovimentacao = () => {
    if (!produtoMovimentacao) return;

    const cheio = parseInt(formMovimentacao.quantidadeCheio) || 0;
    const vazio = parseInt(formMovimentacao.quantidadeVazio) || 0;

    onAddMovimentacao({
      produtoId: produtoMovimentacao.id,
      produto: produtoMovimentacao,
      tipo: formMovimentacao.tipo,
      quantidadeCheio: cheio,
      quantidadeVazio: vazio,
      motivo: formMovimentacao.motivo,
      usuario: 'Sistema',
    });

    // Atualizar estoque do produto
    const cheioDelta = formMovimentacao.tipo === 'entrada' ? cheio : -cheio;
    const vazioDelta = formMovimentacao.tipo === 'entrada' ? vazio : -vazio;
    
    onUpdateProduto(produtoMovimentacao.id, {
      estoqueCheio: Math.max(0, produtoMovimentacao.estoqueCheio + cheioDelta),
      estoqueVazio: Math.max(0, produtoMovimentacao.estoqueVazio + vazioDelta),
    });

    setDialogMovimentacao(false);
    setProdutoMovimentacao(null);
    setFormMovimentacao({
      tipo: 'entrada',
      quantidadeCheio: '',
      quantidadeVazio: '',
      motivo: '',
    });
  };

  const editarProduto = (produto: Produto) => {
    setProdutoEditando(produto);
    setFormProduto({
      codigo: produto.codigo,
      nome: produto.nome,
      descricao: produto.descricao || '',
      tipo: produto.tipo,
      precoVenda: produto.precoVenda.toString(),
      precoCusto: produto.precoCusto.toString(),
      estoqueCheio: produto.estoqueCheio.toString(),
      estoqueVazio: produto.estoqueVazio.toString(),
      estoqueMinimo: produto.estoqueMinimo.toString(),
      unidade: produto.unidade,
      retornaVazio: produto.retornaVazio || false,
      vendeCompleta: produto.vendeCompleta || false,
      precoGalao: produto.precoGalao?.toString() || '',
    });
    setDialogProduto(true);
  };

  const abrirMovimentacao = (produto: Produto) => {
    setProdutoMovimentacao(produto);
    setDialogMovimentacao(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setDialogHistorico(true)}
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Button onClick={() => {
            setProdutoEditando(null);
            setFormProduto({
              codigo: '',
              nome: '',
              descricao: '',
              tipo: 'gas_cozinha',
              precoVenda: '',
              precoCusto: '',
              estoqueCheio: '',
              estoqueVazio: '',
              estoqueMinimo: '5',
              unidade: 'unidade',
              retornaVazio: true,
              vendeCompleta: false,
              precoGalao: '',
            });
            setDialogProduto(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {estoqueBaixo.length > 0 && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> {estoqueBaixo.length} produto(s) com estoque abaixo do mínimo!
          </AlertDescription>
        </Alert>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar produto por nome ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">
            <Package className="w-4 h-4 mr-1" />
            Todos ({produtos.length})
          </TabsTrigger>
          <TabsTrigger value="gas">
            <Flame className="w-4 h-4 mr-1" />
            Gás
          </TabsTrigger>
          <TabsTrigger value="agua">
            <Droplets className="w-4 h-4 mr-1" />
            Água
          </TabsTrigger>
          <TabsTrigger value="alertas">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Alertas ({estoqueBaixo.length})
          </TabsTrigger>
        </TabsList>

        {['todos', 'gas', 'agua', 'alertas'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tab === 'alertas' ? estoqueBaixo : produtosFiltrados.filter(p => 
                tab === 'todos' || p.tipo.includes(tab)
              )).map(produto => (
                <Card key={produto.id} className={produto.estoqueCheio <= produto.estoqueMinimo ? 'border-orange-300' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {produto.tipo.includes('gas') ? (
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-600" />
                          </div>
                        ) : produto.tipo.includes('agua') ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{produto.nome}</CardTitle>
                          <p className="text-sm text-gray-500">{produto.codigo}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => abrirMovimentacao(produto)}
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => editarProduto(produto)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-500"
                          onClick={() => {
                            if (confirm('Deseja realmente excluir este produto?')) {
                              onDeleteProduto(produto.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${produto.estoqueCheio <= produto.estoqueMinimo ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-sm text-gray-500">Estoque Cheio</p>
                        <p className={`text-2xl font-bold ${produto.estoqueCheio <= produto.estoqueMinimo ? 'text-red-600' : 'text-green-600'}`}>
                          {produto.estoqueCheio}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50">
                        <p className="text-sm text-gray-500">Estoque Vazio</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {produto.estoqueVazio}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço de venda:</span>
                        <span className="font-medium">R$ {produto.precoVenda.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço de custo:</span>
                        <span className="font-medium">R$ {produto.precoCusto.toFixed(2)}</span>
                      </div>
                      {produto.precoGalao && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Preço do galão:</span>
                          <span className="font-medium">R$ {produto.precoGalao.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estoque mínimo:</span>
                        <span className="font-medium">{produto.estoqueMinimo}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {produto.retornaVazio && (
                        <Badge variant="secondary" className="text-xs">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Troca vazio
                        </Badge>
                      )}
                      {produto.vendeCompleta && (
                        <Badge variant="secondary" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          Vende c/ galão
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog Produto */}
      <Dialog open={dialogProduto} onOpenChange={setDialogProduto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  value={formProduto.codigo}
                  onChange={(e) => setFormProduto({ ...formProduto, codigo: e.target.value })}
                  placeholder="Código do produto"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={formProduto.tipo} 
                  onValueChange={(v) => setFormProduto({ ...formProduto, tipo: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProduto.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formProduto.nome}
                onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formProduto.descricao}
                onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                placeholder="Descrição opcional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço de Venda</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProduto.precoVenda}
                    onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preço de Custo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProduto.precoCusto}
                    onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Estoque Cheio</Label>
                <Input
                  type="number"
                  min="0"
                  value={formProduto.estoqueCheio}
                  onChange={(e) => setFormProduto({ ...formProduto, estoqueCheio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Vazio</Label>
                <Input
                  type="number"
                  min="0"
                  value={formProduto.estoqueVazio}
                  onChange={(e) => setFormProduto({ ...formProduto, estoqueVazio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input
                  type="number"
                  min="0"
                  value={formProduto.estoqueMinimo}
                  onChange={(e) => setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input
                value={formProduto.unidade}
                onChange={(e) => setFormProduto({ ...formProduto, unidade: e.target.value })}
                placeholder="unidade, litros, kg..."
              />
            </div>

            {/* Opções específicas */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Retorna vazio (troca)</Label>
                  <p className="text-sm text-gray-500">Cliente devolve o vazio na entrega</p>
                </div>
                <Switch
                  checked={formProduto.retornaVazio}
                  onCheckedChange={(v) => setFormProduto({ ...formProduto, retornaVazio: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Vende completo (com galão)</Label>
                  <p className="text-sm text-gray-500">Opção de vender com galão novo</p>
                </div>
                <Switch
                  checked={formProduto.vendeCompleta}
                  onCheckedChange={(v) => setFormProduto({ ...formProduto, vendeCompleta: v })}
                />
              </div>

              {formProduto.vendeCompleta && (
                <div className="space-y-2">
                  <Label>Preço do Galão</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formProduto.precoGalao}
                      onChange={(e) => setFormProduto({ ...formProduto, precoGalao: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSubmitProduto} className="w-full">
              {produtoEditando ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Movimentação */}
      <Dialog open={dialogMovimentacao} onOpenChange={setDialogMovimentacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentação de Estoque</DialogTitle>
          </DialogHeader>
          {produtoMovimentacao && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{produtoMovimentacao.nome}</p>
                <p className="text-sm text-gray-500">
                  Atual: {produtoMovimentacao.estoqueCheio} cheio / {produtoMovimentacao.estoqueVazio} vazio
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Movimentação</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formMovimentacao.tipo === 'entrada' ? 'default' : 'outline'}
                    onClick={() => setFormMovimentacao({ ...formMovimentacao, tipo: 'entrada' })}
                    className="flex-1"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant={formMovimentacao.tipo === 'saida' ? 'default' : 'outline'}
                    onClick={() => setFormMovimentacao({ ...formMovimentacao, tipo: 'saida' as const })}
                    className="flex-1"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2 rotate-180" />
                    Saída
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade Cheio</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formMovimentacao.quantidadeCheio}
                    onChange={(e) => setFormMovimentacao({ ...formMovimentacao, quantidadeCheio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade Vazio</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formMovimentacao.quantidadeVazio}
                    onChange={(e) => setFormMovimentacao({ ...formMovimentacao, quantidadeVazio: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Input
                  value={formMovimentacao.motivo}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, motivo: e.target.value })}
                  placeholder="Ex: Compra de mercadoria, Ajuste de estoque..."
                />
              </div>

              <Button onClick={handleMovimentacao} className="w-full">
                Confirmar Movimentação
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Histórico */}
      <Dialog open={dialogHistorico} onOpenChange={setDialogHistorico}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Data</th>
                  <th className="text-left py-2 px-4">Produto</th>
                  <th className="text-left py-2 px-4">Tipo</th>
                  <th className="text-right py-2 px-4">Cheio</th>
                  <th className="text-right py-2 px-4">Vazio</th>
                  <th className="text-left py-2 px-4">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {[...movimentacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((mov) => (
                  <tr key={mov.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">
                      {new Date(mov.data).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 px-4 text-sm font-medium">
                      {mov.produto?.nome}
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant={mov.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidadeCheio}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidadeVazio}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-500">
                      {mov.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
