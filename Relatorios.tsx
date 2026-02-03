import { useState } from 'react';
import { 
  Calendar, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Package,
  CreditCard,
  Flame,
  Droplets,
  AlertCircle,
  Truck,
  MapPin,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Split,
  UserCheck,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Venda, Cliente, Produto, Caixa } from '@/types';

interface RelatoriosProps {
  vendas: Venda[];
  clientes: Cliente[];
  produtos: Produto[];
  caixas: Caixa[];
  despesas?: any[];
}

export function RelatoriosSection({ vendas, clientes, caixas }: RelatoriosProps) {
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [periodoPredefinido, setPeriodoPredefinido] = useState<'hoje' | 'ontem' | 'semana' | 'mes' | 'personalizado'>('hoje');
  const [dialogImpressao, setDialogImpressao] = useState(false);
  const [relatorioImpressao, setRelatorioImpressao] = useState<any>(null);

  // Função para aplicar período predefinido
  const aplicarPeriodo = (periodo: string) => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    switch (periodo) {
      case 'hoje':
        setDataInicio(hojeStr);
        setDataFim(hojeStr);
        break;
      case 'ontem':
        const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
        const ontemStr = ontem.toISOString().split('T')[0];
        setDataInicio(ontemStr);
        setDataFim(ontemStr);
        break;
      case 'semana':
        const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        setDataInicio(semanaAtras.toISOString().split('T')[0]);
        setDataFim(hojeStr);
        break;
      case 'mes':
        const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        setDataInicio(mesAtras.toISOString().split('T')[0]);
        setDataFim(hojeStr);
        break;
    }
    setPeriodoPredefinido(periodo as any);
  };

  // Navegar entre dias
  const navegarDia = (direcao: 'anterior' | 'proximo') => {
    const dataAtual = new Date(dataInicio);
    const novaData = new Date(dataAtual.getTime() + (direcao === 'anterior' ? -1 : 1) * 24 * 60 * 60 * 1000);
    const novaDataStr = novaData.toISOString().split('T')[0];
    setDataInicio(novaDataStr);
    setDataFim(novaDataStr);
    setPeriodoPredefinido('personalizado');
  };

  // Filtrar vendas por período
  const vendasFiltradas = vendas.filter(v => {
    const dataVenda = v.data.split('T')[0];
    return dataVenda >= dataInicio && dataVenda <= dataFim && v.status === 'concluida';
  });

  // Estatísticas do período
  const totalVendas = vendasFiltradas.reduce((acc, v) => acc + v.valorTotal, 0);
  const quantidadeVendas = vendasFiltradas.length;
  
  // Vendas com pagamento misto
  const vendasPagamentoMisto = vendasFiltradas.filter(v => v.pagamentosParciais && v.pagamentosParciais.length > 0);
  
  // Calcular vendas por forma de pagamento (incluindo pagamentos mistos)
  const vendasPorFormaPagamento = {
    dinheiro: 0,
    cartao: 0,
    pix: 0,
    fiado: 0,
  };
  
  vendasFiltradas.forEach(venda => {
    if (venda.pagamentosParciais && venda.pagamentosParciais.length > 0) {
      // Pagamento misto - somar cada parte
      venda.pagamentosParciais.forEach(pag => {
        vendasPorFormaPagamento[pag.formaPagamento] += pag.valor;
      });
    } else {
      // Pagamento único
      vendasPorFormaPagamento[venda.formaPagamento] += venda.valorTotal;
    }
  });

  // Produtos vendidos no período
  const produtosVendidos: Record<string, { nome: string; quantidade: number; valor: number; tipo: string }> = {};
  vendasFiltradas.forEach(venda => {
    venda.itens.forEach(item => {
      if (!produtosVendidos[item.produtoId]) {
        produtosVendidos[item.produtoId] = {
          nome: item.produto.nome,
          quantidade: 0,
          valor: 0,
          tipo: item.produto.tipo,
        };
      }
      produtosVendidos[item.produtoId].quantidade += item.quantidade;
      produtosVendidos[item.produtoId].valor += item.subtotal;
    });
  });

  const topProdutos = Object.entries(produtosVendidos)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // Vendas fiado no período (incluindo pagamento misto com fiado)
  const vendasFiado = vendasFiltradas.filter(v => {
    if (v.pagamentosParciais) {
      return v.pagamentosParciais.some(p => p.formaPagamento === 'fiado');
    }
    return v.formaPagamento === 'fiado';
  });
  const totalFiadoPeriodo = vendasFiado.reduce((acc, v) => {
    if (v.pagamentosParciais) {
      const fiadoParcial = v.pagamentosParciais.find(p => p.formaPagamento === 'fiado');
      return acc + (fiadoParcial?.valor || 0);
    }
    return acc + v.valorTotal;
  }, 0);

  // Vendas PIX no período (incluindo pagamento misto com PIX)
  const vendasPix = vendasFiltradas.filter(v => {
    if (v.pagamentosParciais) {
      return v.pagamentosParciais.some(p => p.formaPagamento === 'pix');
    }
    return v.formaPagamento === 'pix';
  });
  const totalPixPeriodo = vendasPix.reduce((acc, v) => {
    if (v.pagamentosParciais) {
      const pixParcial = v.pagamentosParciais.find(p => p.formaPagamento === 'pix');
      return acc + (pixParcial?.valor || 0);
    }
    return acc + v.valorTotal;
  }, 0);

  // Clientes que compraram no período
  const clientesPeriodo = [...new Set(vendasFiltradas.filter(v => v.clienteId).map(v => v.clienteId))];
  
  // Clientes que pagaram com PIX
  const clientesPix = vendasPix.map(v => v.cliente).filter(Boolean) as Cliente[];
  const clientesPixUnicos = [...new Map(clientesPix.map(c => [c.id, c])).values()];
  
  // Clientes que compraram no fiado
  const clientesFiadoPeriodo = vendasFiado.map(v => v.cliente).filter(Boolean) as Cliente[];
  const clientesFiadoUnicos = [...new Map(clientesFiadoPeriodo.map(c => [c.id, c])).values()];

  const gerarRelatorioDia = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(v => v.data.startsWith(hoje) && v.status === 'concluida');
    const caixaHoje = caixas.find(c => c.dataAbertura.startsWith(hoje));

    // Calcular vendas por forma de pagamento considerando pagamento misto
    const vendasPorFormaPagamentoHoje = {
      dinheiro: 0,
      cartao: 0,
      pix: 0,
      fiado: 0,
    };
    
    vendasHoje.forEach(venda => {
      if (venda.pagamentosParciais && venda.pagamentosParciais.length > 0) {
        venda.pagamentosParciais.forEach(pag => {
          vendasPorFormaPagamentoHoje[pag.formaPagamento] += pag.valor;
        });
      } else {
        vendasPorFormaPagamentoHoje[venda.formaPagamento] += venda.valorTotal;
      }
    });

    // Clientes PIX do dia
    const vendasPixHoje = vendasHoje.filter(v => {
      if (v.pagamentosParciais) {
        return v.pagamentosParciais.some(p => p.formaPagamento === 'pix');
      }
      return v.formaPagamento === 'pix';
    });
    const clientesPixHoje = [...new Set(vendasPixHoje.map(v => v.clienteId).filter(Boolean))];
    
    // Clientes Fiado do dia
    const vendasFiadoHoje = vendasHoje.filter(v => {
      if (v.pagamentosParciais) {
        return v.pagamentosParciais.some(p => p.formaPagamento === 'fiado');
      }
      return v.formaPagamento === 'fiado';
    });
    const clientesFiadoHoje = [...new Set(vendasFiadoHoje.map(v => v.clienteId).filter(Boolean))];

    const relatorio = {
      data: hoje,
      vendas: vendasHoje,
      caixa: caixaHoje,
      totalVendas: vendasHoje.reduce((acc, v) => acc + v.valorTotal, 0),
      vendasPorFormaPagamento: vendasPorFormaPagamentoHoje,
      clientesFiado: clientes.filter(c => c.saldoDevedor > 0),
      clientesPixDoDia: clientesPixHoje.map(id => clientes.find(c => c.id === id)).filter(Boolean),
      clientesFiadoDoDia: clientesFiadoHoje.map(id => clientes.find(c => c.id === id)).filter(Boolean),
      vendasPagamentoMisto: vendasHoje.filter(v => v.pagamentosParciais && v.pagamentosParciais.length > 0),
    };

    setRelatorioImpressao(relatorio);
    setDialogImpressao(true);
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
        <Button onClick={gerarRelatorioDia} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Relatório do Dia
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Seletor de Período */}
          <div className="mb-4">
            <Label className="text-sm mb-2 block">Período Rápido</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={periodoPredefinido === 'hoje' ? 'default' : 'outline'}
                size="sm"
                onClick={() => aplicarPeriodo('hoje')}
              >
                Hoje
              </Button>
              <Button 
                variant={periodoPredefinido === 'ontem' ? 'default' : 'outline'}
                size="sm"
                onClick={() => aplicarPeriodo('ontem')}
              >
                Ontem
              </Button>
              <Button 
                variant={periodoPredefinido === 'semana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => aplicarPeriodo('semana')}
              >
                Últimos 7 dias
              </Button>
              <Button 
                variant={periodoPredefinido === 'mes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => aplicarPeriodo('mes')}
              >
                Últimos 30 dias
              </Button>
            </div>
          </div>

          {/* Navegação por dia */}
          <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <Button variant="ghost" size="sm" onClick={() => navegarDia('anterior')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">
              {dataInicio === dataFim 
                ? new Date(dataInicio).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                : `${new Date(dataInicio).toLocaleDateString('pt-BR')} até ${new Date(dataFim).toLocaleDateString('pt-BR')}`
              }
            </span>
            <Button variant="ghost" size="sm" onClick={() => navegarDia('proximo')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPeriodoPredefinido('personalizado');
                }}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodoPredefinido('personalizado');
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total em Vendas</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{quantidadeVendas} venda(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clientes Atendidos</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesPeriodo.length}</div>
            <p className="text-xs text-gray-500">clientes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Produtos Vendidos</CardTitle>
            <Package className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(produtosVendidos).reduce((acc, p) => acc + p.quantidade, 0)}
            </div>
            <p className="text-xs text-gray-500">unidades</p>
          </CardContent>
        </Card>

        <Card className={totalFiadoPeriodo > 0 ? 'border-orange-300' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Vendas Fiado</CardTitle>
            <CreditCard className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ {totalFiadoPeriodo.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{vendasFiado.length} venda(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes */}
      <Tabs defaultValue="pagamentos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="produtos">Produtos Vendidos</TabsTrigger>
          <TabsTrigger value="pix">
            <QrCode className="w-4 h-4 mr-1" />
            Clientes PIX
          </TabsTrigger>
          <TabsTrigger value="fiado">Fiado</TabsTrigger>
          <TabsTrigger value="misto">
            <Split className="w-4 h-4 mr-1" />
            Pag. Misto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">Dinheiro</p>
                      <p className="text-sm text-gray-500">
                        {vendasFiltradas.filter(v => v.formaPagamento === 'dinheiro').length} venda(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    R$ {vendasPorFormaPagamento.dinheiro.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">Cartão</p>
                      <p className="text-sm text-gray-500">
                        {vendasFiltradas.filter(v => v.formaPagamento === 'cartao').length} venda(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    R$ {vendasPorFormaPagamento.cartao.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">PIX</p>
                      <p className="text-sm text-gray-500">
                        {vendasFiltradas.filter(v => v.formaPagamento === 'pix').length} venda(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-700">
                    R$ {vendasPorFormaPagamento.pix.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">Fiado</p>
                      <p className="text-sm text-gray-500">
                        {vendasFiado.length} venda(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-700">
                    R$ {vendasPorFormaPagamento.fiado.toFixed(2)}
                  </span>
                </div>
                
                {/* Pagamento Misto */}
                {vendasPagamentoMisto.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Split className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">Pagamento Misto</p>
                        <p className="text-sm text-gray-500">
                          {vendasPagamentoMisto.length} venda(s)
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-indigo-700">
                      R$ {vendasPagamentoMisto.reduce((acc, v) => acc + v.valorTotal, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detalhamento de Produtos Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProdutos.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total de Itens</p>
                      <p className="text-xl font-bold">
                        {Object.values(produtosVendidos).reduce((acc, p) => acc + p.quantidade, 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Produtos Diferentes</p>
                      <p className="text-xl font-bold">{topProdutos.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-xl font-bold text-green-600">
                        R$ {Object.values(produtosVendidos).reduce((acc, p) => acc + p.valor, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Tabela de Produtos */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">#</th>
                          <th className="text-left py-2 px-4">Produto</th>
                          <th className="text-left py-2 px-4">Tipo</th>
                          <th className="text-right py-2 px-4">Qtd</th>
                          <th className="text-right py-2 px-4">Valor Unit.</th>
                          <th className="text-right py-2 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProdutos.map((produto, index) => {
                          const precoMedio = produto.valor / produto.quantidade;
                          return (
                            <tr key={produto.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {produto.tipo.includes('gas') ? (
                                    <Flame className="w-4 h-4 text-orange-500" />
                                  ) : produto.tipo.includes('agua') ? (
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <Package className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="font-medium">{produto.nome}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs text-gray-500">
                                  {produto.tipo.includes('gas') ? 'Gás' : 
                                   produto.tipo.includes('agua') ? 'Água' : 'Outros'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold">{produto.quantidade}</span>
                                <span className="text-xs text-gray-500"> un</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                R$ {precoMedio.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold text-green-600">
                                  R$ {produto.valor.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum produto vendido neste período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Clientes PIX */}
        <TabsContent value="pix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <QrCode className="w-5 h-5" />
                Clientes que Pagaram com PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientesPixUnicos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Clientes Únicos</p>
                        <p className="text-xl font-bold">{clientesPixUnicos.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Vendas PIX</p>
                        <p className="text-xl font-bold">{vendasPix.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total PIX</p>
                        <p className="text-xl font-bold text-purple-600">R$ {totalPixPeriodo.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {clientesPixUnicos.map(cliente => {
                      const vendasClientePix = vendasPix.filter(v => v.clienteId === cliente.id);
                      const totalClientePix = vendasClientePix.reduce((acc, v) => {
                        if (v.pagamentosParciais) {
                          const pixParcial = v.pagamentosParciais.find(p => p.formaPagamento === 'pix');
                          return acc + (pixParcial?.valor || 0);
                        }
                        return acc + v.valorTotal;
                      }, 0);
                      
                      return (
                        <div key={cliente.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-lg">{cliente.nome}</p>
                              <p className="text-sm text-gray-500">{cliente.telefone}</p>
                              <p className="text-sm text-purple-600">
                                {vendasClientePix.length} compra(s) com PIX
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-purple-700">
                              R$ {totalClientePix.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum cliente pagou com PIX neste período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiado" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes com Fiado no Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientesFiadoUnicos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Clientes Únicos</p>
                        <p className="text-xl font-bold">{clientesFiadoUnicos.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Vendas Fiado</p>
                        <p className="text-xl font-bold">{vendasFiado.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total Fiado</p>
                        <p className="text-xl font-bold text-orange-600">R$ {totalFiadoPeriodo.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {clientesFiadoUnicos.map(cliente => {
                      const vendasClienteFiado = vendasFiado.filter(v => v.clienteId === cliente.id);
                      const totalClienteFiado = vendasClienteFiado.reduce((acc, v) => {
                        if (v.pagamentosParciais) {
                          const fiadoParcial = v.pagamentosParciais.find(p => p.formaPagamento === 'fiado');
                          return acc + (fiadoParcial?.valor || 0);
                        }
                        return acc + v.valorTotal;
                      }, 0);
                      
                      return (
                        <div key={cliente.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-lg">{cliente.nome}</p>
                              <p className="text-sm text-gray-500">{cliente.telefone}</p>
                              <p className="text-sm text-orange-600">
                                {vendasClienteFiado.length} compra(s) no fiado
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-orange-700">
                              R$ {totalClienteFiado.toFixed(2)}
                            </span>
                            {cliente.saldoDevedor > 0 && (
                              <p className="text-sm text-gray-500">
                                Saldo total: R$ {cliente.saldoDevedor.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum cliente comprou no fiado neste período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Pagamento Misto */}
        <TabsContent value="misto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Split className="w-5 h-5" />
                Vendas com Pagamento Misto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendasPagamentoMisto.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Vendas Mistas</p>
                      <p className="text-xl font-bold">{vendasPagamentoMisto.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-xl font-bold text-indigo-600">
                        R$ {vendasPagamentoMisto.reduce((acc, v) => acc + v.valorTotal, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Média por Venda</p>
                      <p className="text-xl font-bold">
                        R$ {(vendasPagamentoMisto.reduce((acc, v) => acc + v.valorTotal, 0) / vendasPagamentoMisto.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {vendasPagamentoMisto.map(venda => (
                    <div key={venda.id} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-indigo-100">{venda.codigo}</Badge>
                          <span className="font-medium">{venda.cliente?.nome || 'Cliente não identificado'}</span>
                        </div>
                        <span className="text-xl font-bold text-indigo-700">
                          R$ {venda.valorTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {venda.pagamentosParciais?.map((pag, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                            <span className="capitalize flex items-center gap-2">
                              {pag.formaPagamento === 'dinheiro' && <DollarSign className="w-4 h-4 text-green-600" />}
                              {pag.formaPagamento === 'cartao' && <CreditCard className="w-4 h-4 text-blue-600" />}
                              {pag.formaPagamento === 'pix' && <QrCode className="w-4 h-4 text-purple-600" />}
                              {pag.formaPagamento === 'fiado' && <TrendingDown className="w-4 h-4 text-orange-600" />}
                              {pag.formaPagamento}
                            </span>
                            <span className="font-medium">R$ {pag.valor.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {venda.observacoes && (
                        <p className="text-sm text-gray-500 mt-2">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {venda.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Split className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma venda com pagamento misto neste período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Impressão */}
      <Dialog open={dialogImpressao} onOpenChange={setDialogImpressao}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Relatório do Dia</span>
              <Button onClick={imprimirRelatorio} size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {relatorioImpressao && (
            <div id="relatorio-impressao" className="space-y-6 p-6 border rounded-lg">
              {/* Cabeçalho */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">GasAgua Pro</h2>
                <p className="text-gray-500">Relatório de Fechamento de Caixa</p>
                <p className="text-lg font-medium mt-2">
                  {new Date(relatorioImpressao.data).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total em Vendas</p>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {relatorioImpressao.totalVendas.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Quantidade de Vendas</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {relatorioImpressao.vendas.length}
                  </p>
                </div>
              </div>

              {/* Por Forma de Pagamento */}
              <div>
                <h3 className="font-bold text-lg mb-3">Vendas por Forma de Pagamento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Dinheiro:</span>
                    <span className="font-medium">R$ {relatorioImpressao.vendasPorFormaPagamento.dinheiro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Cartão:</span>
                    <span className="font-medium">R$ {relatorioImpressao.vendasPorFormaPagamento.cartao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>PIX:</span>
                    <span className="font-medium">R$ {relatorioImpressao.vendasPorFormaPagamento.pix.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-orange-50 rounded text-orange-700">
                    <span>Fiado:</span>
                    <span className="font-medium">R$ {relatorioImpressao.vendasPorFormaPagamento.fiado.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Clientes PIX do Dia */}
              {relatorioImpressao.clientesPixDoDia && relatorioImpressao.clientesPixDoDia.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-purple-700">
                    <QrCode className="w-5 h-5 inline mr-2" />
                    Clientes que Pagaram com PIX
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.clientesPixDoDia.map((cliente: Cliente) => (
                      <div key={cliente.id} className="flex justify-between p-2 bg-purple-50 rounded border border-purple-200">
                        <span>{cliente.nome}</span>
                        <span className="font-medium">{cliente.telefone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes Fiado do Dia */}
              {relatorioImpressao.clientesFiadoDoDia && relatorioImpressao.clientesFiadoDoDia.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-orange-700">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    Clientes que Compraram no Fiado Hoje
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.clientesFiadoDoDia.map((cliente: Cliente) => (
                      <div key={cliente.id} className="flex justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <span>{cliente.nome}</span>
                        <span className="font-medium">{cliente.telefone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fiado Geral */}
              {relatorioImpressao.clientesFiado.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-orange-700">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    Aviso: Todos os Clientes com Fiado
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.clientesFiado.map((cliente: Cliente) => (
                      <div key={cliente.id} className="flex justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <span>{cliente.nome}</span>
                        <span className="font-medium">R$ {cliente.saldoDevedor.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-orange-100 rounded text-right">
                    <span className="font-bold">Total em Fiado: R$ {relatorioImpressao.clientesFiado.reduce((acc: number, c: Cliente) => acc + c.saldoDevedor, 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Pagamento Misto */}
              {relatorioImpressao.vendasPagamentoMisto && relatorioImpressao.vendasPagamentoMisto.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-indigo-700">
                    <Split className="w-5 h-5 inline mr-2" />
                    Vendas com Pagamento Misto
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.vendasPagamentoMisto.map((venda: Venda) => (
                      <div key={venda.id} className="p-2 bg-indigo-50 rounded border border-indigo-200">
                        <div className="flex justify-between">
                          <span className="font-medium">{venda.codigo}</span>
                          <span>R$ {venda.valorTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{venda.cliente?.nome}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {venda.pagamentosParciais?.map((p, i) => (
                            <span key={i} className="mr-2">{p.formaPagamento}: R$ {p.valor.toFixed(2)}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entregas */}
              {relatorioImpressao.vendas.filter((v: Venda) => v.ehEntrega).length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-blue-700">
                    <Truck className="w-5 h-5 inline mr-2" />
                    Entregas do Dia
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.vendas.filter((v: Venda) => v.ehEntrega).map((venda: Venda) => (
                      <div key={venda.id} className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex justify-between">
                          <span className="font-medium">{venda.codigo}</span>
                          <span>R$ {venda.valorTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{venda.cliente?.nome}</p>
                        <p className="text-sm text-blue-600">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {venda.enderecoEntrega}
                        </p>
                        {venda.observacoes && (
                          <p className="text-xs text-gray-500 mt-1">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {venda.observacoes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Vendas */}
              <div>
                <h3 className="font-bold text-lg mb-3">Detalhamento das Vendas</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Código</th>
                      <th className="text-left py-2">Hora</th>
                      <th className="text-left py-2">Cliente</th>
                      <th className="text-left py-2">Pagamento</th>
                      <th className="text-right py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorioImpressao.vendas.map((venda: Venda) => {
                      const isPix = venda.formaPagamento === 'pix' || venda.pagamentosParciais?.some(p => p.formaPagamento === 'pix');
                      const isFiado = venda.formaPagamento === 'fiado' || venda.pagamentosParciais?.some(p => p.formaPagamento === 'fiado');
                      const isMisto = venda.pagamentosParciais && venda.pagamentosParciais.length > 0;
                      
                      return (
                        <tr key={venda.id} className={`border-b ${isPix ? 'bg-purple-50' : isFiado ? 'bg-orange-50' : ''}`}>
                          <td className="py-2">
                            {venda.codigo}
                            {venda.ehEntrega && (
                              <span className="ml-2 text-blue-600">
                                <Truck className="w-3 h-3 inline" />
                              </span>
                            )}
                          </td>
                          <td className="py-2">{new Date(venda.data).toLocaleTimeString('pt-BR')}</td>
                          <td className="py-2">{venda.cliente?.nome || 'Cliente não identificado'}</td>
                          <td className="py-2">
                            {isMisto ? (
                              <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">
                                <Split className="w-3 h-3 inline mr-1" />
                                MISTO
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs ${
                                isFiado ? 'bg-orange-100 text-orange-700' : 
                                isPix ? 'bg-purple-100 text-purple-700' : 
                                'bg-green-100 text-green-700'
                              }`}>
                                {isPix && <QrCode className="w-3 h-3 inline mr-1" />}
                                {isFiado && <TrendingDown className="w-3 h-3 inline mr-1" />}
                                {venda.formaPagamento.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right">R$ {venda.valorTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Observações das Vendas */}
              {relatorioImpressao.vendas.filter((v: Venda) => v.observacoes).length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">
                    <FileText className="w-5 h-5 inline mr-2" />
                    Observações das Vendas
                  </h3>
                  <div className="space-y-2">
                    {relatorioImpressao.vendas.filter((v: Venda) => v.observacoes).map((venda: Venda) => (
                      <div key={venda.id} className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">{venda.codigo}</span>
                        <span className="text-gray-500 mx-2">-</span>
                        <span className="italic">{venda.observacoes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rodapé */}
              <div className="border-t pt-4 text-center text-sm text-gray-500">
                <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
                <p className="mt-1">GasAgua Pro - Sistema de Gestão</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
