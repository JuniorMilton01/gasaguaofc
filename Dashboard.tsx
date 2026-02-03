import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  Flame,
  Droplets,
  X,
  RotateCcw,
  Truck,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Produto, Venda, Cliente, Caixa, Usuario } from '@/types';

interface DashboardProps {
  produtos: Produto[];
  vendas: Venda[];
  clientes: Cliente[];
  caixa: Caixa | undefined;
  usuario?: Usuario | null;
  onTelaChange: (tela: string) => void;
  onCancelarVenda?: (id: string, motivo: string, usuario: string) => void;
  onAtualizarEstoque?: (produtoId: string, cheioDelta: number, vazioDelta: number, motivo: string) => void;
}

export function Dashboard({ produtos, vendas, clientes, caixa, usuario, onTelaChange, onCancelarVenda, onAtualizarEstoque }: DashboardProps) {
  const [hoje] = useState(new Date().toISOString().split('T')[0]);
  const [dialogVendas, setDialogVendas] = useState(false);
  const [dialogCancelar, setDialogCancelar] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  
  // Estatísticas do dia
  const vendasHoje = vendas.filter(v => v.data.startsWith(hoje) && v.status === 'concluida');
  const totalVendasHoje = vendasHoje.reduce((acc, v) => acc + v.valorTotal, 0);
  const quantidadeVendasHoje = vendasHoje.length;
  
  // Vendas por forma de pagamento
  const vendasPorPagamento = {
    dinheiro: vendasHoje.filter(v => v.formaPagamento === 'dinheiro').reduce((acc, v) => acc + v.valorTotal, 0),
    cartao: vendasHoje.filter(v => v.formaPagamento === 'cartao').reduce((acc, v) => acc + v.valorTotal, 0),
    pix: vendasHoje.filter(v => v.formaPagamento === 'pix').reduce((acc, v) => acc + v.valorTotal, 0),
    fiado: vendasHoje.filter(v => v.formaPagamento === 'fiado').reduce((acc, v) => acc + v.valorTotal, 0),
  };

  // Estoque baixo
  const estoqueBaixo = produtos.filter(p => p.estoqueCheio <= p.estoqueMinimo);
  
  // Clientes fiado
  const clientesFiado = clientes.filter(c => c.saldoDevedor > 0);
  const totalFiado = clientesFiado.reduce((acc, c) => acc + c.saldoDevedor, 0);

  // Produtos mais vendidos hoje
  const produtosVendidos: Record<string, { nome: string; quantidade: number; valor: number }> = {};
  vendasHoje.forEach(venda => {
    venda.itens.forEach(item => {
      if (!produtosVendidos[item.produtoId]) {
        produtosVendidos[item.produtoId] = {
          nome: item.produto.nome,
          quantidade: 0,
          valor: 0,
        };
      }
      produtosVendidos[item.produtoId].quantidade += item.quantidade;
      produtosVendidos[item.produtoId].valor += item.subtotal;
    });
  });

  const topProdutos = Object.values(produtosVendidos)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Resumo do dia {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex gap-2">
          {caixa?.status === 'aberto' ? (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Caixa Aberto
            </span>
          ) : (
            <Button onClick={() => onTelaChange('caixa')} variant="destructive">
              Caixa Fechado - Abrir
            </Button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {estoqueBaixo.length > 0 && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> {estoqueBaixo.length} produto(s) com estoque baixo!
            <Button 
              variant="link" 
              className="text-orange-800 underline ml-2 p-0 h-auto"
              onClick={() => onTelaChange('estoque')}
            >
              Ver estoque
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Vendas Hoje</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendasHoje.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{quantidadeVendasHoje} venda(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clientes Fiado</CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalFiado.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{clientesFiado.length} cliente(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Produtos Estoque</CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-gray-500">{estoqueBaixo.length} com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Clientes</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-gray-500">cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Forma de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Dinheiro</p>
                    <p className="text-sm text-gray-500">
                      {vendasHoje.filter(v => v.formaPagamento === 'dinheiro').length} venda(s)
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-700">
                  R$ {vendasPorPagamento.dinheiro.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cartão</p>
                    <p className="text-sm text-gray-500">
                      {vendasHoje.filter(v => v.formaPagamento === 'cartao').length} venda(s)
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  R$ {vendasPorPagamento.cartao.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-gray-500">
                      {vendasHoje.filter(v => v.formaPagamento === 'pix').length} venda(s)
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-700">
                  R$ {vendasPorPagamento.pix.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Fiado</p>
                    <p className="text-sm text-gray-500">
                      {vendasHoje.filter(v => v.formaPagamento === 'fiado').length} venda(s)
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-700">
                  R$ {vendasPorPagamento.fiado.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {topProdutos.length > 0 ? (
              <div className="space-y-3">
                {topProdutos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-gray-500">{produto.quantidade} unidade(s)</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700">
                      R$ {produto.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma venda hoje</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendas do Dia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendas do Dia</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setDialogVendas(true)}>
            Ver Todas ({vendasHoje.length})
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vendasHoje.slice(0, 5).map(venda => (
              <div key={venda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{venda.codigo}</span>
                    {venda.ehEntrega && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        <Truck className="w-3 h-3 mr-1" />
                        Entrega
                      </Badge>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      venda.formaPagamento === 'dinheiro' ? 'bg-green-100 text-green-700' :
                      venda.formaPagamento === 'cartao' ? 'bg-blue-100 text-blue-700' :
                      venda.formaPagamento === 'pix' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {venda.formaPagamento.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(venda.data).toLocaleTimeString('pt-BR')} • 
                    {venda.cliente?.nome || 'Cliente não identificado'}
                  </p>
                  {venda.observacoes && (
                    <p className="text-xs text-gray-400 italic">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {venda.observacoes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">R$ {venda.valorTotal.toFixed(2)}</span>
                  {onCancelarVenda && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500"
                      onClick={() => {
                        setVendaSelecionada(venda);
                        setDialogCancelar(true);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {vendasHoje.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma venda hoje</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estoque Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {produtos.filter(p => p.tipo.includes('gas')).slice(0, 4).map(produto => (
              <div key={produto.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-sm">{produto.nome}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cheio:</span>
                    <span className={`font-medium ${produto.estoqueCheio <= produto.estoqueMinimo ? 'text-red-600' : 'text-green-600'}`}>
                      {produto.estoqueCheio}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vazio:</span>
                    <span className="font-medium text-blue-600">{produto.estoqueVazio}</span>
                  </div>
                </div>
              </div>
            ))}
            {produtos.filter(p => p.tipo.includes('agua')).slice(0, 4).map(produto => (
              <div key={produto.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">{produto.nome}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cheio:</span>
                    <span className={`font-medium ${produto.estoqueCheio <= produto.estoqueMinimo ? 'text-red-600' : 'text-green-600'}`}>
                      {produto.estoqueCheio}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vazio:</span>
                    <span className="font-medium text-blue-600">{produto.estoqueVazio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Todas as Vendas */}
      <Dialog open={dialogVendas} onOpenChange={setDialogVendas}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Todas as Vendas do Dia</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {vendasHoje.map(venda => (
                <div key={venda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{venda.codigo}</span>
                      {venda.ehEntrega && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          <Truck className="w-3 h-3 mr-1" />
                          Entrega
                        </Badge>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        venda.formaPagamento === 'dinheiro' ? 'bg-green-100 text-green-700' :
                        venda.formaPagamento === 'cartao' ? 'bg-blue-100 text-blue-700' :
                        venda.formaPagamento === 'pix' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {venda.formaPagamento.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(venda.data).toLocaleTimeString('pt-BR')} • 
                      {venda.cliente?.nome || 'Cliente não identificado'}
                    </p>
                    {venda.observacoes && (
                      <p className="text-xs text-gray-400 italic">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {venda.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">R$ {venda.valorTotal.toFixed(2)}</span>
                    {onCancelarVenda && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                          setVendaSelecionada(venda);
                          setDialogCancelar(true);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog Cancelar Venda */}
      <Dialog open={dialogCancelar} onOpenChange={setDialogCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <X className="w-5 h-5" />
              Cancelar Venda
            </DialogTitle>
          </DialogHeader>
          {vendaSelecionada && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{vendaSelecionada.codigo}</p>
                <p className="text-sm text-gray-500">
                  Cliente: {vendaSelecionada.cliente?.nome || 'Não identificado'}
                </p>
                <p className="text-lg font-bold text-green-600">
                  R$ {vendaSelecionada.valorTotal.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Motivo do Cancelamento *</Label>
                <Input
                  placeholder="Digite o motivo do cancelamento"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                />
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Atenção:</strong> O estoque será restaurado automaticamente ao cancelar esta venda.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setDialogCancelar(false);
                    setVendaSelecionada(null);
                    setMotivoCancelamento('');
                  }}
                >
                  Voltar
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  disabled={!motivoCancelamento.trim()}
                  onClick={() => {
                    if (onCancelarVenda && vendaSelecionada) {
                      onCancelarVenda(vendaSelecionada.id, motivoCancelamento, usuario?.nome || 'Sistema');
                      
                      // Restaurar estoque
                      if (onAtualizarEstoque) {
                        vendaSelecionada.itens.forEach(item => {
                          const cheioDelta = item.quantidade;
                          const vazioDelta = item.retornaVazio ? -item.quantidade : 0;
                          onAtualizarEstoque(item.produtoId, cheioDelta, vazioDelta, `Cancelamento venda ${vendaSelecionada.codigo}`);
                        });
                      }
                      
                      setDialogCancelar(false);
                      setVendaSelecionada(null);
                      setMotivoCancelamento('');
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Confirmar Cancelamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
