import { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Search,
  Flame,
  Droplets,
  Check,
  X,
  RotateCcw,
  Package,
  Truck,
  MapPin,
  FileText,
  DollarSign,
  CreditCard,
  Split,
  RefreshCw,
  AlertTriangle,
  Beaker
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Produto, Cliente, ItemVenda, FormaPagamento, Caixa, PagamentoParcial, DevolucaoEmbalagem } from '@/types';

interface VendasProps {
  produtos: Produto[];
  clientes: Cliente[];
  caixa: Caixa | undefined;
  usuario?: any;
  onVenda: (venda: any) => void;
  onAtualizarEstoque: (produtoId: string, cheioDelta: number, vazioDelta: number, motivo: string) => void;
  onAtualizarSaldoCliente: (clienteId: string, valor: number, operacao: 'adicionar' | 'subtrair') => void;
  onRegistrarPagamentoFiado?: (clienteId: string, valor: number, formaPagamento: string) => void;
  onAddMovimentacaoCaixa?: (caixaId: string, movimentacao: any) => void;
  // Novas funções para devolução, troca e resto
  onRegistrarDevolucao?: (produtoId: string, quantidade: number, motivo: string) => void;
  onRegistrarTroca?: (produtoId: string, quantidade: number, motivo: string) => void;
  onRegistrarResto?: (produtoId: string, quantidade: number, percentual: number) => void;
}

export function VendasSection({ produtos, clientes, caixa, usuario, onVenda, onAtualizarEstoque, onAtualizarSaldoCliente, onRegistrarPagamentoFiado, onAddMovimentacaoCaixa, onRegistrarDevolucao, onRegistrarTroca, onRegistrarResto }: VendasProps) {
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [dialogCliente, setDialogCliente] = useState(false);
  const [dialogFinalizar, setDialogFinalizar] = useState(false);
  const [vendaConcluida, setVendaConcluida] = useState(false);
  
  // Entrega
  const [ehEntrega, setEhEntrega] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState(5);
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  
  // Pagamento de fiado
  const [dialogPagamentoFiado, setDialogPagamentoFiado] = useState(false);
  const [clientePagamento, setClientePagamento] = useState<Cliente | null>(null);
  const [valorPagamentoFiado, setValorPagamentoFiado] = useState('');
  const [formaPagamentoFiado, setFormaPagamentoFiado] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  
  // Pagamento Misto
  const [pagamentoMisto, setPagamentoMisto] = useState(false);
  const [pagamentosParciais, setPagamentosParciais] = useState<PagamentoParcial[]>([]);
  
  // Devolução de Embalagens
  const [dialogDevolucao, setDialogDevolucao] = useState(false);
  const [devolucoes, setDevolucoes] = useState<DevolucaoEmbalagem[]>([]);
  const [produtoDevolucao, setProdutoDevolucao] = useState<string>('');
  const [quantidadeDevolucao, setQuantidadeDevolucao] = useState(1);
  const [valorCreditoDevolucao, setValorCreditoDevolucao] = useState(0);
  
  // Troca de Produtos
  const [dialogTroca, setDialogTroca] = useState(false);
  const [produtoTroca, setProdutoTroca] = useState<string>('');
  const [quantidadeTroca, setQuantidadeTroca] = useState(1);
  const [motivoTroca, setMotivoTroca] = useState('');
  const [novoProdutoTroca, setNovoProdutoTroca] = useState<string>('');
  
  // Resto de Gás
  const [dialogResto, setDialogResto] = useState(false);
  const [produtoResto, setProdutoResto] = useState<string>('');
  const [quantidadeResto, setQuantidadeResto] = useState(1);
  const [percentualResto, setPercentualResto] = useState(30);
  const [valorCreditoResto, setValorCreditoResto] = useState(0);

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.telefone.includes(buscaCliente)
  );

  const adicionarItem = (produto: Produto, retornaVazio: boolean = true, vendeCompleta: boolean = false) => {
    const itemExistente = itens.find(item => 
      item.produtoId === produto.id && 
      item.retornaVazio === retornaVazio && 
      item.vendeCompleta === vendeCompleta
    );

    if (itemExistente) {
      setItens(itens.map(item => 
        item.id === itemExistente.id 
          ? { 
              ...item, 
              quantidade: item.quantidade + 1,
              subtotal: (item.quantidade + 1) * item.precoUnitario
            }
          : item
      ));
    } else {
      const preco = vendeCompleta && produto.precoGalao 
        ? produto.precoVenda + produto.precoGalao 
        : produto.precoVenda;

      const novoItem: ItemVenda = {
        id: crypto.randomUUID(),
        produtoId: produto.id,
        produto,
        quantidade: 1,
        precoUnitario: preco,
        subtotal: preco,
        retornaVazio: produto.retornaVazio ? retornaVazio : undefined,
        vendeCompleta: produto.vendeCompleta ? vendeCompleta : undefined,
      };
      setItens([...itens, novoItem]);
    }
  };

  const removerItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const atualizarQuantidade = (id: string, delta: number) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const novaQuantidade = Math.max(1, item.quantidade + delta);
        return {
          ...item,
          quantidade: novaQuantidade,
          subtotal: novaQuantidade * item.precoUnitario
        };
      }
      return item;
    }));
  };

  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const taxaEntregaValor = ehEntrega ? taxaEntrega : 0;
  const totalCreditoDevolucoes = devolucoes.reduce((acc, d) => acc + d.valorCredito, 0);
  const valorTotal = subtotal - desconto + taxaEntregaValor - totalCreditoDevolucoes;

  // Calcular valor restante para pagamento misto
  const calcularValorRestante = () => {
    const totalPago = pagamentosParciais.reduce((acc, p) => acc + p.valor, 0);
    return Math.max(0, valorTotal - totalPago);
  };

  const adicionarPagamentoParcial = (forma: FormaPagamento, valor: number) => {
    if (valor <= 0) return;
    const restante = calcularValorRestante();
    const valorReal = Math.min(valor, restante);
    
    const existente = pagamentosParciais.find(p => p.formaPagamento === forma);
    if (existente) {
      setPagamentosParciais(pagamentosParciais.map(p => 
        p.formaPagamento === forma 
          ? { ...p, valor: p.valor + valorReal }
          : p
      ));
    } else {
      setPagamentosParciais([...pagamentosParciais, { formaPagamento: forma, valor: valorReal }]);
    }
  };

  const removerPagamentoParcial = (forma: FormaPagamento) => {
    setPagamentosParciais(pagamentosParciais.filter(p => p.formaPagamento !== forma));
  };

  const finalizarVenda = () => {
    if (itens.length === 0) return;
    if (formaPagamento === 'fiado' && !clienteSelecionado) {
      alert('Selecione um cliente para venda fiada');
      return;
    }
    
    // Validar pagamento misto
    if (pagamentoMisto) {
      const totalPago = pagamentosParciais.reduce((acc, p) => acc + p.valor, 0);
      if (totalPago < valorTotal) {
        alert(`Valor pago (R$ ${totalPago.toFixed(2)}) é menor que o total (R$ ${valorTotal.toFixed(2)})`);
        return;
      }
    }

    const venda = {
      clienteId: clienteSelecionado?.id,
      cliente: clienteSelecionado || undefined,
      itens: itens.map(item => ({
        ...item,
        subtotal: item.quantidade * item.precoUnitario
      })),
      subtotal,
      desconto,
      taxaEntrega: taxaEntregaValor,
      valorTotal,
      formaPagamento: pagamentoMisto ? 'dinheiro' as FormaPagamento : formaPagamento, // Forma principal quando misto
      pagamentosParciais: pagamentoMisto ? pagamentosParciais : undefined,
      observacoes,
      // Entrega
      ehEntrega,
      enderecoEntrega: ehEntrega ? (enderecoEntrega || clienteSelecionado?.endereco ? 
        `${clienteSelecionado?.endereco?.rua}, ${clienteSelecionado?.endereco?.numero} - ${clienteSelecionado?.endereco?.bairro}` : 
        enderecoEntrega) : undefined,
      taxaEntregaValor,
      pago: formaPagamento !== 'fiado' || (pagamentoMisto && !pagamentosParciais.some(p => p.formaPagamento === 'fiado')),
      // Devoluções
      devolucoesEmbalagem: devolucoes.length > 0 ? devolucoes : undefined,
    };

    onVenda(venda);

    // Atualizar estoque
    itens.forEach(item => {
      const cheioDelta = -item.quantidade;
      const vazioDelta = item.retornaVazio ? item.quantidade : 0;
      onAtualizarEstoque(item.produtoId, cheioDelta, vazioDelta, `Venda ${venda.formaPagamento}`);
    });

    // Registrar devoluções no estoque
    devolucoes.forEach(dev => {
      if (onRegistrarDevolucao) {
        onRegistrarDevolucao(dev.produtoId, dev.quantidade, 'Devolução de embalagem na venda');
      }
    });

    // Atualizar saldo do cliente se for fiado
    if (formaPagamento === 'fiado' && clienteSelecionado) {
      onAtualizarSaldoCliente(clienteSelecionado.id, valorTotal, 'adicionar');
    }
    
    // Se houver fiado no pagamento misto
    if (pagamentoMisto) {
      const fiadoParcial = pagamentosParciais.find(p => p.formaPagamento === 'fiado');
      if (fiadoParcial && clienteSelecionado) {
        onAtualizarSaldoCliente(clienteSelecionado.id, fiadoParcial.valor, 'adicionar');
      }
    }

    setVendaConcluida(true);
    setTimeout(() => {
      setDialogFinalizar(false);
      limparVenda();
    }, 2000);
  };

  const limparVenda = () => {
    setItens([]);
    setClienteSelecionado(null);
    setBuscaCliente('');
    setFormaPagamento('dinheiro');
    setDesconto(0);
    setObservacoes('');
    setVendaConcluida(false);
    setEhEntrega(false);
    setTaxaEntrega(5);
    setEnderecoEntrega('');
    // Limpar pagamento misto
    setPagamentoMisto(false);
    setPagamentosParciais([]);
    // Limpar devoluções
    setDevolucoes([]);
    setProdutoDevolucao('');
    setQuantidadeDevolucao(1);
    setValorCreditoDevolucao(0);
    // Limpar troca
    setProdutoTroca('');
    setQuantidadeTroca(1);
    setMotivoTroca('');
    setNovoProdutoTroca('');
    // Limpar resto
    setProdutoResto('');
    setQuantidadeResto(1);
    setPercentualResto(30);
    setValorCreditoResto(0);
  };

  if (!caixa || caixa.status === 'fechado') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Vendas (PDV)</h1>
        <Alert variant="destructive">
          <AlertDescription>
            O caixa precisa estar aberto para realizar vendas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-800">Vendas (PDV)</h1>
          {/* Botão de Pagamento de Fiado */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDialogPagamentoFiado(true)}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Receber Fiado
          </Button>
          {/* Botão de Devolução de Embalagens */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDialogDevolucao(true)}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Devolução
          </Button>
          {/* Botão de Troca */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDialogTroca(true)}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Troca
          </Button>
          {/* Botão de Resto de Gás */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDialogResto(true)}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Beaker className="w-4 h-4 mr-2" />
            Resto de Gás
          </Button>
        </div>
        {clienteSelecionado && (
          <Badge variant="secondary" className="text-lg py-2 px-4">
            <User className="w-4 h-4 mr-2" />
            {clienteSelecionado.nome}
            <button 
              onClick={() => setClienteSelecionado(null)}
              className="ml-2 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="gas">
                <Flame className="w-4 h-4 mr-1" />
                Gás
              </TabsTrigger>
              <TabsTrigger value="agua">
                <Droplets className="w-4 h-4 mr-1" />
                Água
              </TabsTrigger>
              <TabsTrigger value="outros">
                <Package className="w-4 h-4 mr-1" />
                Outros
              </TabsTrigger>
            </TabsList>

            {['todos', 'gas', 'agua', 'outros'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {produtos
                    .filter(p => tab === 'todos' || p.tipo.includes(tab))
                    .map(produto => (
                    <Card 
                      key={produto.id} 
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${
                        produto.estoqueCheio <= 0 ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          {produto.tipo.includes('gas') ? (
                            <Flame className="w-5 h-5 text-orange-500" />
                          ) : produto.tipo.includes('agua') ? (
                            <Droplets className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-500" />
                          )}
                          <Badge variant={produto.estoqueCheio > produto.estoqueMinimo ? 'default' : 'destructive'} className="text-xs">
                            {produto.estoqueCheio}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm mb-1">{produto.nome}</h3>
                        <p className="text-lg font-bold text-green-600">
                          R$ {produto.precoVenda.toFixed(2)}
                        </p>
                        
                        {produto.retornaVazio && (
                          <div className="mt-2 space-y-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => adicionarItem(produto, true)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Troca (devolve vazio)
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => adicionarItem(produto, false)}
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Novo (não devolve)
                            </Button>
                          </div>
                        )}
                        
                        {produto.vendeCompleta && (
                          <div className="mt-2 space-y-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => adicionarItem(produto, false, false)}
                            >
                              <Droplets className="w-3 h-3 mr-1" />
                              Só água
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              onClick={() => adicionarItem(produto, false, true)}
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Completo (c/ galão)
                            </Button>
                          </div>
                        )}
                        
                        {!produto.retornaVazio && !produto.vendeCompleta && (
                          <Button 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => adicionarItem(produto)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={limparVenda}
                  disabled={itens.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 -mx-6 px-6">
                {itens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itens.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.produto.nome}</p>
                          {item.retornaVazio !== undefined && (
                            <p className="text-xs text-gray-500">
                              {item.retornaVazio ? 'Troca (devolve vazio)' : 'Novo'}
                            </p>
                          )}
                          {item.vendeCompleta !== undefined && (
                            <p className="text-xs text-gray-500">
                              {item.vendeCompleta ? 'Completo c/ galão' : 'Só água'}
                            </p>
                          )}
                          <p className="text-sm text-green-600">
                            R$ {item.precoUnitario.toFixed(2)} x {item.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8"
                            onClick={() => atualizarQuantidade(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantidade}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8"
                            onClick={() => atualizarQuantidade(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => removerItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {itens.length > 0 && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  {/* Cliente */}
                  <div>
                    <Label className="text-sm">Cliente (opcional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Buscar cliente..."
                        value={buscaCliente}
                        onChange={(e) => setBuscaCliente(e.target.value)}
                        className="flex-1"
                      />
                      <Dialog open={dialogCliente} onOpenChange={setDialogCliente}>
                        <Button 
                          variant="outline" 
                          onClick={() => setDialogCliente(true)}
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Selecionar Cliente</DialogTitle>
                          </DialogHeader>
                          <Input
                            placeholder="Buscar por nome ou telefone..."
                            value={buscaCliente}
                            onChange={(e) => setBuscaCliente(e.target.value)}
                            className="mb-4"
                          />
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {clientesFiltrados.map(cliente => (
                                <button
                                  key={cliente.id}
                                  onClick={() => {
                                    setClienteSelecionado(cliente);
                                    setDialogCliente(false);
                                    setBuscaCliente('');
                                  }}
                                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 border"
                                >
                                  <p className="font-medium">{cliente.nome}</p>
                                  <p className="text-sm text-gray-500">{cliente.telefone}</p>
                                  {cliente.saldoDevedor > 0 && (
                                    <p className="text-sm text-orange-600">
                                      Saldo devedor: R$ {cliente.saldoDevedor.toFixed(2)}
                                    </p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Forma de Pagamento</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPagamentoMisto(!pagamentoMisto);
                          setPagamentosParciais([]);
                        }}
                        className={pagamentoMisto ? 'text-blue-600' : 'text-gray-500'}
                      >
                        <Split className="w-4 h-4 mr-1" />
                        {pagamentoMisto ? 'Pagamento Único' : 'Pagamento Misto'}
                      </Button>
                    </div>
                    
                    {!pagamentoMisto ? (
                      <div className="grid grid-cols-2 gap-2">
                        {(['dinheiro', 'cartao', 'pix', 'fiado'] as FormaPagamento[]).map((forma) => (
                          <Button
                            key={forma}
                            type="button"
                            variant={formaPagamento === forma ? 'default' : 'outline'}
                            onClick={() => setFormaPagamento(forma)}
                            className="text-sm"
                          >
                            {forma === 'dinheiro' && 'Dinheiro'}
                            {forma === 'cartao' && 'Cartão'}
                            {forma === 'pix' && 'PIX'}
                            {forma === 'fiado' && 'Fiado'}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          Valor Restante: R$ {calcularValorRestante().toFixed(2)}
                        </p>
                        
                        {/* Lista de pagamentos parciais */}
                        {pagamentosParciais.length > 0 && (
                          <div className="space-y-1">
                            {pagamentosParciais.map((pag) => (
                              <div key={pag.formaPagamento} className="flex items-center justify-between bg-white p-2 rounded">
                                <span className="text-sm capitalize">{pag.formaPagamento}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">R$ {pag.valor.toFixed(2)}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-red-500"
                                    onClick={() => removerPagamentoParcial(pag.formaPagamento)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Adicionar pagamento parcial */}
                        {calcularValorRestante() > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {(['dinheiro', 'cartao', 'pix', 'fiado'] as FormaPagamento[]).map((forma) => (
                              <Button
                                key={forma}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const restante = calcularValorRestante();
                                  adicionarPagamentoParcial(forma, restante);
                                }}
                                className="text-xs"
                              >
                                + {forma === 'dinheiro' ? 'Dinheiro' : forma === 'cartao' ? 'Cartão' : forma === 'pix' ? 'PIX' : 'Fiado'}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Input para valor personalizado */}
                        {calcularValorRestante() > 0 && (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={calcularValorRestante()}
                                placeholder="Valor"
                                className="pl-8 text-sm"
                                id="valor-parcial"
                              />
                            </div>
                            <Select 
                              onValueChange={(forma) => {
                                const input = document.getElementById('valor-parcial') as HTMLInputElement;
                                const valor = parseFloat(input?.value || '0');
                                if (valor > 0) {
                                  adicionarPagamentoParcial(forma as FormaPagamento, valor);
                                  if (input) input.value = '';
                                }
                              }}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Forma" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="cartao">Cartão</SelectItem>
                                <SelectItem value="pix">PIX</SelectItem>
                                <SelectItem value="fiado">Fiado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Entrega */}
                  <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <Label className="text-sm font-medium">É entrega?</Label>
                      </div>
                      <Switch
                        checked={ehEntrega}
                        onCheckedChange={setEhEntrega}
                      />
                    </div>
                    
                    {ehEntrega && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm">Taxa de Entrega</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <Input
                              type="number"
                              step="0.50"
                              min="0"
                              value={taxaEntrega}
                              onChange={(e) => setTaxaEntrega(parseFloat(e.target.value) || 0)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Endereço de Entrega
                          </Label>
                          <Input
                            placeholder={clienteSelecionado?.endereco ? 
                              `${clienteSelecionado.endereco.rua}, ${clienteSelecionado.endereco.numero}` : 
                              "Digite o endereço de entrega"
                            }
                            value={enderecoEntrega}
                            onChange={(e) => setEnderecoEntrega(e.target.value)}
                          />
                          {clienteSelecionado?.endereco && !enderecoEntrega && (
                            <p className="text-xs text-gray-500">
                              Será usado o endereço do cliente: {clienteSelecionado.endereco.bairro}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Observações */}
                  <div>
                    <Label className="text-sm flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Observações da Venda
                    </Label>
                    <Input
                      placeholder="Observações que aparecerão no relatório"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Desconto */}
                  <div>
                    <Label className="text-sm">Desconto</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={subtotal}
                        value={desconto || ''}
                        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Devoluções de Embalagens */}
                  {devolucoes.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg space-y-2">
                      <Label className="text-sm text-green-800 flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        Devoluções de Embalagens
                      </Label>
                      {devolucoes.map((dev, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                          <span>{dev.produtoNome} x{dev.quantidade}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">- R$ {dev.valorCredito.toFixed(2)}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-red-500"
                              onClick={() => setDevolucoes(devolucoes.filter((_, i) => i !== index))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-1 text-sm font-medium text-green-700">
                        Total em créditos: R$ {totalCreditoDevolucoes.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Totais */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {desconto > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto:</span>
                        <span>- R$ {desconto.toFixed(2)}</span>
                      </div>
                    )}
                    {ehEntrega && taxaEntregaValor > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Taxa de Entrega:</span>
                        <span>+ R$ {taxaEntregaValor.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {valorTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Finalizar */}
                  <Dialog open={dialogFinalizar} onOpenChange={setDialogFinalizar}>
                    <Button 
                      className="w-full text-lg py-6"
                      onClick={() => setDialogFinalizar(true)}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Finalizar Venda
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Venda</DialogTitle>
                      </DialogHeader>
                      
                      {vendaConcluida ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold text-green-600 mb-2">Venda Concluída!</h3>
                          <p className="text-gray-500">Redirecionando...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Itens:</span>
                              <span>{itens.reduce((acc, i) => acc + i.quantidade, 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            {desconto > 0 && (
                              <div className="flex justify-between text-sm text-red-600">
                                <span>Desconto:</span>
                                <span>- R$ {desconto.toFixed(2)}</span>
                              </div>
                            )}
                            {ehEntrega && taxaEntregaValor > 0 && (
                              <div className="flex justify-between text-sm text-blue-600">
                                <span>Taxa de Entrega:</span>
                                <span>+ R$ {taxaEntregaValor.toFixed(2)}</span>
                              </div>
                            )}
                            {observacoes && (
                              <div className="text-sm text-gray-600 border-t pt-2">
                                <span className="font-medium">Observações:</span>
                                <p className="italic">{observacoes}</p>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total:</span>
                              <span className="text-green-600">R$ {valorTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          {formaPagamento === 'fiado' && clienteSelecionado && (
                            <Alert className="bg-orange-50 border-orange-200">
                              <AlertDescription className="text-orange-800">
                                <strong>Atenção:</strong> Esta venda será registrada como fiado para {clienteSelecionado.nome}.
                                Saldo atual: R$ {clienteSelecionado.saldoDevedor.toFixed(2)}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setDialogFinalizar(false)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={finalizarVenda}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Pagamento de Fiado */}
      <Dialog open={dialogPagamentoFiado} onOpenChange={setDialogPagamentoFiado}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <CreditCard className="w-5 h-5" />
              Receber Pagamento de Fiado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Seleção do Cliente */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select 
                value={clientePagamento?.id || ''} 
                onValueChange={(id) => {
                  const cliente = clientes.find(c => c.id === id);
                  setClientePagamento(cliente || null);
                  if (cliente) {
                    setValorPagamentoFiado(cliente.saldoDevedor.toString());
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.filter(c => c.saldoDevedor > 0).map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex justify-between w-full">
                        <span>{cliente.nome}</span>
                        <span className="text-orange-600 ml-4">
                          R$ {cliente.saldoDevedor.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clientePagamento && (
              <>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Saldo Devedor</p>
                  <p className="text-2xl font-bold text-orange-700">
                    R$ {clientePagamento.saldoDevedor.toFixed(2)}
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
                      max={clientePagamento.saldoDevedor}
                      value={valorPagamentoFiado}
                      onChange={(e) => setValorPagamentoFiado(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dinheiro', 'cartao', 'pix'] as const).map((forma) => (
                      <Button
                        key={forma}
                        type="button"
                        variant={formaPagamentoFiado === forma ? 'default' : 'outline'}
                        onClick={() => setFormaPagamentoFiado(forma)}
                      >
                        {forma === 'dinheiro' && 'Dinheiro'}
                        {forma === 'cartao' && 'Cartão'}
                        {forma === 'pix' && 'PIX'}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  disabled={!valorPagamentoFiado || parseFloat(valorPagamentoFiado) <= 0 || parseFloat(valorPagamentoFiado) > clientePagamento.saldoDevedor}
                  onClick={() => {
                    const valor = parseFloat(valorPagamentoFiado);
                    if (valor > 0 && valor <= clientePagamento.saldoDevedor) {
                      // Atualizar saldo do cliente
                      onAtualizarSaldoCliente(clientePagamento.id, valor, 'subtrair');
                      
                      // Registrar no caixa
                      if (caixa && onAddMovimentacaoCaixa) {
                        onAddMovimentacaoCaixa(caixa.id, {
                          tipo: 'pagamento_fiado',
                          valor,
                          descricao: `Pagamento de fiado - ${clientePagamento.nome} (${formaPagamentoFiado})`,
                          usuario: usuario?.nome || 'Sistema',
                        });
                      }
                      
                      // Callback opcional
                      if (onRegistrarPagamentoFiado) {
                        onRegistrarPagamentoFiado(clientePagamento.id, valor, formaPagamentoFiado);
                      }
                      
                      // Limpar
                      setDialogPagamentoFiado(false);
                      setClientePagamento(null);
                      setValorPagamentoFiado('');
                      setFormaPagamentoFiado('dinheiro');
                    }
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Devolução de Embalagens */}
      <Dialog open={dialogDevolucao} onOpenChange={setDialogDevolucao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <RefreshCw className="w-5 h-5" />
              Devolução de Embalagens
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoDevolucao} onValueChange={setProdutoDevolucao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter(p => p.retornaVazio).map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeDevolucao(Math.max(1, quantidadeDevolucao - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input 
                  type="number" 
                  min="1"
                  value={quantidadeDevolucao}
                  onChange={(e) => setQuantidadeDevolucao(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeDevolucao(quantidadeDevolucao + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor do Crédito por Unidade</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorCreditoDevolucao}
                  onChange={(e) => setValorCreditoDevolucao(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              className="w-full"
              disabled={!produtoDevolucao || quantidadeDevolucao <= 0}
              onClick={() => {
                const produto = produtos.find(p => p.id === produtoDevolucao);
                if (produto) {
                  const novaDevolucao: DevolucaoEmbalagem = {
                    produtoId: produto.id,
                    produtoNome: produto.nome,
                    quantidade: quantidadeDevolucao,
                    valorCredito: valorCreditoDevolucao * quantidadeDevolucao,
                  };
                  setDevolucoes([...devolucoes, novaDevolucao]);
                  setDialogDevolucao(false);
                  setProdutoDevolucao('');
                  setQuantidadeDevolucao(1);
                  setValorCreditoDevolucao(0);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Devolução
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Troca de Produto */}
      <Dialog open={dialogTroca} onOpenChange={setDialogTroca}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <AlertTriangle className="w-5 h-5" />
              Troca de Produto (Defeito)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto com Defeito</Label>
              <Select value={produtoTroca} onValueChange={setProdutoTroca}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeTroca(Math.max(1, quantidadeTroca - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input 
                  type="number" 
                  min="1"
                  value={quantidadeTroca}
                  onChange={(e) => setQuantidadeTroca(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeTroca(quantidadeTroca + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo da Troca</Label>
              <Input
                placeholder="Ex: Vazamento, válvula quebrada..."
                value={motivoTroca}
                onChange={(e) => setMotivoTroca(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Novo Produto (Substituto)</Label>
              <Select value={novoProdutoTroca} onValueChange={setNovoProdutoTroca}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full"
              disabled={!produtoTroca || !novoProdutoTroca || !motivoTroca || quantidadeTroca <= 0}
              onClick={() => {
                const produtoDefeito = produtos.find(p => p.id === produtoTroca);
                const produtoNovo = produtos.find(p => p.id === novoProdutoTroca);
                if (produtoDefeito && produtoNovo && onRegistrarTroca) {
                  onRegistrarTroca(produtoTroca, quantidadeTroca, motivoTroca);
                  
                  // Adicionar o novo produto ao carrinho automaticamente
                  const novoItem: ItemVenda = {
                    id: crypto.randomUUID(),
                    produtoId: produtoNovo.id,
                    produto: produtoNovo,
                    quantidade: quantidadeTroca,
                    precoUnitario: 0, // Troca não cobra
                    subtotal: 0,
                  };
                  setItens([...itens, novoItem]);
                  
                  setDialogTroca(false);
                  setProdutoTroca('');
                  setQuantidadeTroca(1);
                  setMotivoTroca('');
                  setNovoProdutoTroca('');
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirmar Troca
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Resto de Gás */}
      <Dialog open={dialogResto} onOpenChange={setDialogResto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Beaker className="w-5 h-5" />
              Resto de Gás
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoResto} onValueChange={setProdutoResto}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter(p => p.tipo.includes('gas')).map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade de Botijões</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeResto(Math.max(1, quantidadeResto - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input 
                  type="number" 
                  min="1"
                  value={quantidadeResto}
                  onChange={(e) => setQuantidadeResto(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantidadeResto(quantidadeResto + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Percentual de Gás Restante (médio)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="range" 
                  min="5"
                  max="90"
                  value={percentualResto}
                  onChange={(e) => setPercentualResto(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{percentualResto}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor do Crédito por Unidade</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorCreditoResto}
                  onChange={(e) => setValorCreditoResto(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Total em crédito: <strong>R$ {(valorCreditoResto * quantidadeResto).toFixed(2)}</strong>
              </p>
            </div>

            <Button 
              className="w-full"
              disabled={!produtoResto || quantidadeResto <= 0}
              onClick={() => {
                const produto = produtos.find(p => p.id === produtoResto);
                if (produto && onRegistrarResto) {
                  onRegistrarResto(produtoResto, quantidadeResto, percentualResto);
                  
                  // Adicionar crédito como desconto
                  const creditoTotal = valorCreditoResto * quantidadeResto;
                  setDesconto(desconto + creditoTotal);
                  
                  setDialogResto(false);
                  setProdutoResto('');
                  setQuantidadeResto(1);
                  setPercentualResto(30);
                  setValorCreditoResto(0);
                }
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Resto de Gás
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}