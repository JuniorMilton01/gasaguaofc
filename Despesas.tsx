import { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingDown,
  Calendar,
  Filter,
  Receipt,
  Wrench,
  Fuel,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Despesa, Caixa, Usuario } from '@/types';

interface DespesasProps {
  despesas: Despesa[];
  caixa: Caixa | undefined;
  usuario: Usuario | null;
  onAddDespesa: (despesa: any) => void;
  onDeleteDespesa: (id: string) => void;
  onAddMovimentacaoCaixa?: (caixaId: string, movimentacao: any) => void;
}

const categoriasDespesa = [
  { value: 'despesa', label: 'Despesa Geral', icon: Receipt },
  { value: 'manutencao', label: 'Manutenção', icon: Wrench },
  { value: 'combustivel', label: 'Combustível', icon: Fuel },
  { value: 'salario', label: 'Salário', icon: User },
  { value: 'outros', label: 'Outros', icon: MoreHorizontal },
];

export function DespesasSection({ 
  despesas, 
  caixa, 
  usuario, 
  onAddDespesa, 
  onDeleteDespesa,
  onAddMovimentacaoCaixa 
}: DespesasProps) {
  const [dialogNova, setDialogNova] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('hoje');
  
  const [formDespesa, setFormDespesa] = useState({
    valor: '',
    motivo: '',
    descricao: '',
    categoria: 'despesa' as const,
  });

  // Filtrar despesas por período
  const despesasFiltradas = despesas.filter(d => {
    const dataDespesa = new Date(d.data);
    const hoje = new Date();
    
    switch (filtroPeriodo) {
      case 'hoje':
        return d.data.startsWith(hoje.toISOString().split('T')[0]);
      case 'semana':
        const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataDespesa >= umaSemanaAtras;
      case 'mes':
        const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        return dataDespesa >= umMesAtras;
      default:
        return true;
    }
  });

  const totalDespesas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);

  const handleSubmit = () => {
    const valor = parseFloat(formDespesa.valor);
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor válido');
      return;
    }
    if (!formDespesa.motivo.trim()) {
      alert('Digite o motivo da despesa');
      return;
    }

    onAddDespesa({
      valor,
      motivo: formDespesa.motivo,
      descricao: formDespesa.descricao,
      categoria: formDespesa.categoria,
      usuario: usuario?.nome || 'Sistema',
    });

    // Registrar no caixa se estiver aberto
    if (caixa && onAddMovimentacaoCaixa) {
      onAddMovimentacaoCaixa(caixa.id, {
        tipo: 'despesa',
        valor,
        descricao: `Despesa: ${formDespesa.motivo}`,
        usuario: usuario?.nome || 'Sistema',
      });
    }

    setDialogNova(false);
    setFormDespesa({
      valor: '',
      motivo: '',
      descricao: '',
      categoria: 'despesa',
    });
  };

  const getIconCategoria = (categoria: string) => {
    const cat = categoriasDespesa.find(c => c.value === categoria);
    return cat ? cat.icon : MoreHorizontal;
  };

  const getLabelCategoria = (categoria: string) => {
    const cat = categoriasDespesa.find(c => c.value === categoria);
    return cat ? cat.label : 'Outros';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Despesas</h1>
        <Button onClick={() => setDialogNova(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Despesas</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">R$ {totalDespesas.toFixed(2)}</div>
            <p className="text-xs text-red-600">
              {despesasFiltradas.length} despesa(s) no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Maior Despesa</CardTitle>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {despesasFiltradas.length > 0 ? Math.max(...despesasFiltradas.map(d => d.valor)).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Média por Despesa</CardTitle>
            <Receipt className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {despesasFiltradas.length > 0 ? (totalDespesas / despesasFiltradas.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filtroPeriodo === 'hoje' ? 'default' : 'outline'}
          onClick={() => setFiltroPeriodo('hoje')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Hoje
        </Button>
        <Button
          variant={filtroPeriodo === 'semana' ? 'default' : 'outline'}
          onClick={() => setFiltroPeriodo('semana')}
        >
          <Filter className="w-4 h-4 mr-2" />
          Última Semana
        </Button>
        <Button
          variant={filtroPeriodo === 'mes' ? 'default' : 'outline'}
          onClick={() => setFiltroPeriodo('mes')}
        >
          <Filter className="w-4 h-4 mr-2" />
          Último Mês
        </Button>
        <Button
          variant={filtroPeriodo === 'todos' ? 'default' : 'outline'}
          onClick={() => setFiltroPeriodo('todos')}
        >
          Todos
        </Button>
      </div>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {despesasFiltradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(despesa => {
                const IconCategoria = getIconCategoria(despesa.categoria);
                return (
                  <div key={despesa.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        despesa.categoria === 'combustivel' ? 'bg-yellow-100' :
                        despesa.categoria === 'manutencao' ? 'bg-blue-100' :
                        despesa.categoria === 'salario' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <IconCategoria className={`w-5 h-5 ${
                          despesa.categoria === 'combustivel' ? 'text-yellow-600' :
                          despesa.categoria === 'manutencao' ? 'text-blue-600' :
                          despesa.categoria === 'salario' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{despesa.motivo}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(despesa.data).toLocaleString('pt-BR')} • {despesa.usuario}
                        </p>
                        {despesa.descricao && (
                          <p className="text-xs text-gray-400">{despesa.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {getLabelCategoria(despesa.categoria)}
                      </Badge>
                      <span className="font-bold text-red-600">
                        - R$ {despesa.valor.toFixed(2)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                          if (confirm('Deseja excluir esta despesa?')) {
                            onDeleteDespesa(despesa.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {despesasFiltradas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma despesa registrada neste período</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog Nova Despesa */}
      <Dialog open={dialogNova} onOpenChange={setDialogNova}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={formDespesa.categoria} 
                onValueChange={(v) => setFormDespesa({ ...formDespesa, categoria: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDespesa.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formDespesa.valor}
                  onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Input
                placeholder="Ex: Combustível para entregas"
                value={formDespesa.motivo}
                onChange={(e) => setFormDespesa({ ...formDespesa, motivo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Mais detalhes sobre a despesa"
                value={formDespesa.descricao}
                onChange={(e) => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Registrar Despesa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
