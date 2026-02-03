import { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  AlertCircle,
  User,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Caixa, Usuario } from '@/types';

interface CaixaProps {
  caixa: Caixa | undefined;
  usuario: Usuario;
  onAbrirCaixa: (funcionario: string, valorAbertura: number) => void;
  onFecharCaixa: (id: string, funcionario: string, valorFechamento: number, observacoes?: string) => void;
  onAddMovimentacao: (caixaId: string, movimentacao: { tipo: 'sangria' | 'reforco' | 'pagamento_fiado'; valor: number; descricao: string; usuario: string }) => void;
}

export function CaixaSection({ caixa, usuario, onAbrirCaixa, onFecharCaixa, onAddMovimentacao }: CaixaProps) {
  const [valorAbertura, setValorAbertura] = useState('');
  const [valorFechamento, setValorFechamento] = useState('');
  const [observacoesFechamento, setObservacoesFechamento] = useState('');
  const [valorMovimentacao, setValorMovimentacao] = useState('');
  const [descricaoMovimentacao, setDescricaoMovimentacao] = useState('');
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'sangria' | 'reforco' | 'pagamento_fiado'>('sangria');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogFecharOpen, setDialogFecharOpen] = useState(false);

  const handleAbrirCaixa = () => {
    const valor = parseFloat(valorAbertura);
    if (isNaN(valor) || valor < 0) {
      alert('Digite um valor válido');
      return;
    }
    onAbrirCaixa(usuario.nome, valor);
    setValorAbertura('');
  };

  const handleFecharCaixa = () => {
    if (!caixa) return;
    const valor = parseFloat(valorFechamento);
    if (isNaN(valor) || valor < 0) {
      alert('Digite um valor válido');
      return;
    }
    onFecharCaixa(caixa.id, usuario.nome, valor, observacoesFechamento);
    setDialogFecharOpen(false);
    setValorFechamento('');
    setObservacoesFechamento('');
  };

  const handleAddMovimentacao = () => {
    if (!caixa) return;
    const valor = parseFloat(valorMovimentacao);
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor válido');
      return;
    }
    if (!descricaoMovimentacao.trim()) {
      alert('Digite uma descrição');
      return;
    }
    onAddMovimentacao(caixa.id, {
      tipo: tipoMovimentacao,
      valor,
      descricao: descricaoMovimentacao,
      usuario: usuario.nome,
    });
    setValorMovimentacao('');
    setDescricaoMovimentacao('');
    setDialogOpen(false);
  };

  // Calcular saldo do caixa
  const saldoCaixa = caixa ? 
    caixa.valorAbertura + caixa.totalDinheiro + caixa.totalPagamentosFiado + caixa.totalReforcos - caixa.totalSangrias : 0;

  if (!caixa || caixa.status === 'fechado') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Controle de Caixa</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Caixa Fechado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O caixa precisa ser aberto para iniciar as vendas do dia.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="valorAbertura">Valor de Abertura (Troco)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="valorAbertura"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={valorAbertura}
                  onChange={(e) => setValorAbertura(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Funcionário</Label>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <User className="w-5 h-5 text-gray-500" />
                <span>{usuario.nome}</span>
              </div>
            </div>

            <Button 
              onClick={handleAbrirCaixa}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Unlock className="w-5 h-5 mr-2" />
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Controle de Caixa</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Aberto em {new Date(caixa.dataAbertura).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tipoMovimentacao === 'reforco' ? 'default' : 'outline'}
                      onClick={() => setTipoMovimentacao('reforco')}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Reforço
                    </Button>
                    <Button
                      type="button"
                      variant={tipoMovimentacao === 'sangria' ? 'default' : 'outline'}
                      onClick={() => setTipoMovimentacao('sangria')}
                      className="flex-1"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Sangria
                    </Button>
                    <Button
                      type="button"
                      variant={tipoMovimentacao === 'pagamento_fiado' ? 'default' : 'outline'}
                      onClick={() => setTipoMovimentacao('pagamento_fiado')}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pag. Fiado
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorMov">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="valorMov"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={valorMovimentacao}
                      onChange={(e) => setValorMovimentacao(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descMov">Descrição</Label>
                  <Input
                    id="descMov"
                    placeholder="Digite a descrição"
                    value={descricaoMovimentacao}
                    onChange={(e) => setDescricaoMovimentacao(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddMovimentacao} className="w-full">
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogFecharOpen} onOpenChange={setDialogFecharOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Lock className="w-4 h-4 mr-2" />
                Fechar Caixa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Fechamento de Caixa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    Saldo esperado: <strong>R$ {saldoCaixa.toFixed(2)}</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-500">Abertura:</span>
                    <span className="float-right font-medium">R$ {caixa.valorAbertura.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500">Vendas Dinheiro:</span>
                    <span className="float-right font-medium text-green-600">+ R$ {caixa.totalDinheiro.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500">Pag. Fiado:</span>
                    <span className="float-right font-medium text-green-600">+ R$ {caixa.totalPagamentosFiado.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500">Reforços:</span>
                    <span className="float-right font-medium text-green-600">+ R$ {caixa.totalReforcos.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500">Sangrias:</span>
                    <span className="float-right font-medium text-red-600">- R$ {caixa.totalSangrias.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorFechamento">Valor de Fechamento (Contagem)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="valorFechamento"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={valorFechamento}
                      onChange={(e) => setValorFechamento(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obsFechamento">Observações</Label>
                  <Input
                    id="obsFechamento"
                    placeholder="Observações do fechamento"
                    value={observacoesFechamento}
                    onChange={(e) => setObservacoesFechamento(e.target.value)}
                  />
                </div>

                {valorFechamento && (
                  <Alert className={parseFloat(valorFechamento) === saldoCaixa ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
                    <AlertDescription className={parseFloat(valorFechamento) === saldoCaixa ? 'text-green-800' : 'text-yellow-800'}>
                      {parseFloat(valorFechamento) === saldoCaixa 
                        ? '✓ Caixa conferido corretamente' 
                        : `Diferença: R$ ${(parseFloat(valorFechamento) - saldoCaixa).toFixed(2)}`}
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleFecharCaixa} variant="destructive" className="w-full">
                  Confirmar Fechamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo do Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Saldo em Caixa</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">R$ {saldoCaixa.toFixed(2)}</div>
            <p className="text-sm text-green-600 mt-1">Disponível para movimentação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Vendas</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {caixa.totalVendas.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <div className="flex justify-between">
                <span>Dinheiro:</span>
                <span className="font-medium">R$ {caixa.totalDinheiro.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartão:</span>
                <span className="font-medium">R$ {caixa.totalCartao.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>PIX:</span>
                <span className="font-medium">R$ {caixa.totalPix.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Fiado:</span>
                <span className="font-medium">R$ {caixa.totalFiado.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Movimentações</CardTitle>
            <TrendingDown className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Reforços:</span>
                <span className="font-medium text-green-600">+ R$ {caixa.totalReforcos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Sangrias:</span>
                <span className="font-medium text-red-600">- R$ {caixa.totalSangrias.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Pag. Fiado:</span>
                <span className="font-medium text-blue-600">+ R$ {caixa.totalPagamentosFiado.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Líquido:</span>
                  <span className="font-bold">R$ {(caixa.totalReforcos + caixa.totalPagamentosFiado - caixa.totalSangrias).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {caixa.movimentacoes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Data/Hora</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-left py-2 px-4">Descrição</th>
                    <th className="text-left py-2 px-4">Usuário</th>
                    <th className="text-right py-2 px-4">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...caixa.movimentacoes].reverse().map((mov) => (
                    <tr key={mov.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm">
                        {new Date(mov.data).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mov.tipo === 'abertura' ? 'bg-green-100 text-green-700' :
                          mov.tipo === 'fechamento' ? 'bg-red-100 text-red-700' :
                          mov.tipo === 'reforco' ? 'bg-blue-100 text-blue-700' :
                          mov.tipo === 'pagamento_fiado' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {mov.tipo === 'abertura' && 'Abertura'}
                          {mov.tipo === 'fechamento' && 'Fechamento'}
                          {mov.tipo === 'reforco' && 'Reforço'}
                          {mov.tipo === 'sangria' && 'Sangria'}
                          {mov.tipo === 'pagamento_fiado' && 'Pag. Fiado'}
                          {mov.tipo === 'venda' && 'Venda'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm">{mov.descricao}</td>
                      <td className="py-2 px-4 text-sm">{mov.usuario}</td>
                      <td className="py-2 px-4 text-right font-medium">
                        <span className={
                          mov.tipo === 'sangria' ? 'text-red-600' : 'text-green-600'
                        }>
                          {mov.tipo === 'sangria' ? '-' : '+'} R$ {mov.valor.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma movimentação registrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
