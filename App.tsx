import { useState, useEffect } from 'react';
import { Login } from './sections/Login';
import { Layout } from './sections/Layout';
import { Dashboard } from './sections/Dashboard';
import { CaixaSection } from './sections/Caixa';
import { VendasSection } from './sections/Vendas';
import { EstoqueSection } from './sections/Estoque';
import { ClientesSection } from './sections/Clientes';
import { DespesasSection } from './sections/Despesas';
import { RelatoriosSection } from './sections/Relatorios';
import { ConfiguracoesSection } from './sections/Configuracoes';
import { 
  useUsuarios, 
  useClientes, 
  useProdutos, 
  useVendas, 
  useCaixa,
  useMovimentacoesEstoque,
  useConfiguracoes,
  useDespesas 
} from './hooks/useDados';

type Tela = 'dashboard' | 'vendas' | 'estoque' | 'clientes' | 'caixa' | 'despesas' | 'relatorios' | 'configuracoes';

function App() {
  const [logado, setLogado] = useState(false);
  const [telaAtual, setTelaAtual] = useState<Tela>('dashboard');
  const [carregando, setCarregando] = useState(true);

  const { usuarios, usuarioLogado, login, logout, addUsuario, updateUsuario, deleteUsuario } = useUsuarios();
  const { clientes, addCliente, updateCliente, deleteCliente, getClienteById, atualizarSaldoDevedor, analisarConsumoCliente } = useClientes();
  const { produtos, addProduto, updateProduto, deleteProduto, atualizarEstoque, registrarDevolucaoEmbalagem, registrarTrocaProduto, registrarRestoGas } = useProdutos();
  const { vendas, addVenda, cancelarVenda } = useVendas();
  const { caixas, getCaixaAberto, abrirCaixa, fecharCaixa, addMovimentacao, registrarVendaCaixa } = useCaixa();
  const { movimentacoes, addMovimentacao: addMovEstoque } = useMovimentacoesEstoque();
  const { despesas, addDespesa, deleteDespesa } = useDespesas();
  const { configuracoes, updateConfiguracoes } = useConfiguracoes();

  const caixaAberto = getCaixaAberto();

  useEffect(() => {
    // Verificar se há usuário logado
    if (usuarioLogado) {
      setLogado(true);
    }
    setCarregando(false);
  }, [usuarioLogado]);

  // Adicionar produtos padrão se não houver nenhum
  useEffect(() => {
    if (produtos.length === 0 && !carregando) {
      // Gás
      addProduto({
        codigo: 'GAS001',
        nome: 'Gás P13 - 13kg',
        descricao: 'Botijão de gás de cozinha 13kg',
        tipo: 'gas_cozinha',
        precoVenda: 95.00,
        precoCusto: 70.00,
        estoqueCheio: 20,
        estoqueVazio: 15,
        estoqueMinimo: 5,
        unidade: 'unidade',
        retornaVazio: true,
        vendeCompleta: false,
      });
      addProduto({
        codigo: 'GAS002',
        nome: 'Gás P45 - 45kg',
        descricao: 'Botijão de gás industrial 45kg',
        tipo: 'gas_industrial',
        precoVenda: 320.00,
        precoCusto: 250.00,
        estoqueCheio: 10,
        estoqueVazio: 5,
        estoqueMinimo: 3,
        unidade: 'unidade',
        retornaVazio: true,
        vendeCompleta: false,
      });
      addProduto({
        codigo: 'GAS003',
        nome: 'Gás Empilhadeira',
        descricao: 'Gás para empilhadeira',
        tipo: 'gas_empilhadeira',
        precoVenda: 280.00,
        precoCusto: 220.00,
        estoqueCheio: 8,
        estoqueVazio: 4,
        estoqueMinimo: 2,
        unidade: 'unidade',
        retornaVazio: true,
        vendeCompleta: false,
      });
      
      // Água
      addProduto({
        codigo: 'AGU001',
        nome: 'Água 20L',
        descricao: 'Galão de água 20 litros',
        tipo: 'agua_20l',
        precoVenda: 8.00,
        precoCusto: 4.00,
        estoqueCheio: 30,
        estoqueVazio: 20,
        estoqueMinimo: 10,
        unidade: 'unidade',
        retornaVazio: true,
        vendeCompleta: true,
        precoGalao: 35.00,
      });
      addProduto({
        codigo: 'AGU002',
        nome: 'Água 10L',
        descricao: 'Galão de água 10 litros',
        tipo: 'agua_10l',
        precoVenda: 5.00,
        precoCusto: 2.50,
        estoqueCheio: 25,
        estoqueVazio: 15,
        estoqueMinimo: 8,
        unidade: 'unidade',
        retornaVazio: true,
        vendeCompleta: true,
        precoGalao: 25.00,
      });
      addProduto({
        codigo: 'AGU003',
        nome: 'Água Garrafinha 500ml',
        descricao: 'Água mineral 500ml',
        tipo: 'agua_garrafinha',
        precoVenda: 2.50,
        precoCusto: 1.20,
        estoqueCheio: 100,
        estoqueVazio: 0,
        estoqueMinimo: 20,
        unidade: 'unidade',
        retornaVazio: false,
        vendeCompleta: false,
      });
    }
  }, [produtos.length, carregando]);

  const handleLogin = (loginStr: string, senha: string): boolean => {
    const sucesso = login(loginStr, senha);
    if (sucesso) {
      setLogado(true);
    }
    return sucesso;
  };

  const handleLogout = () => {
    logout();
    setLogado(false);
    setTelaAtual('dashboard');
  };

  const handleVenda = (vendaData: any) => {
    const novaVenda = addVenda(vendaData);
    
    // Registrar no caixa aberto (com suporte a pagamento misto)
    if (caixaAberto) {
      registrarVendaCaixa(
        caixaAberto.id, 
        vendaData.valorTotal, 
        vendaData.formaPagamento,
        vendaData.pagamentosParciais
      );
    }

    // Adicionar ao histórico do cliente
    if (vendaData.clienteId) {
      const cliente = getClienteById(vendaData.clienteId);
      if (cliente) {
        // Aqui você pode adicionar ao histórico do cliente
      }
    }

    return novaVenda;
  };

  const handleQuitarFiado = (clienteId: string, valor: number) => {
    atualizarSaldoDevedor(clienteId, valor, 'subtrair');
    
    // Registrar pagamento no caixa
    if (caixaAberto) {
      addMovimentacao(caixaAberto.id, {
        tipo: 'pagamento_fiado',
        valor,
        descricao: `Pagamento de fiado - Cliente: ${getClienteById(clienteId)?.nome}`,
        usuario: usuarioLogado?.nome || 'Sistema',
      });
    }
  };

  const renderTela = () => {
    switch (telaAtual) {
      case 'dashboard':
        return (
          <Dashboard 
            produtos={produtos}
            vendas={vendas}
            clientes={clientes}
            caixa={caixaAberto}
            usuario={usuarioLogado}
            onTelaChange={(tela) => setTelaAtual(tela as Tela)}
            onCancelarVenda={cancelarVenda}
            onAtualizarEstoque={atualizarEstoque}
          />
        );
      case 'vendas':
        return (
          <VendasSection
            produtos={produtos}
            clientes={clientes}
            caixa={caixaAberto}
            usuario={usuarioLogado}
            onVenda={handleVenda}
            onAtualizarEstoque={atualizarEstoque}
            onAtualizarSaldoCliente={atualizarSaldoDevedor}
            onRegistrarPagamentoFiado={handleQuitarFiado}
            onAddMovimentacaoCaixa={addMovimentacao}
            onRegistrarDevolucao={registrarDevolucaoEmbalagem}
            onRegistrarTroca={registrarTrocaProduto}
            onRegistrarResto={registrarRestoGas}
          />
        );
      case 'estoque':
        return (
          <EstoqueSection
            produtos={produtos}
            movimentacoes={movimentacoes}
            onAddProduto={addProduto}
            onUpdateProduto={updateProduto}
            onDeleteProduto={deleteProduto}
            onAddMovimentacao={addMovEstoque}
          />
        );
      case 'clientes':
        return (
          <ClientesSection
            clientes={clientes}
            vendas={vendas}
            onAddCliente={addCliente}
            onUpdateCliente={updateCliente}
            onDeleteCliente={deleteCliente}
            onQuitarFiado={handleQuitarFiado}
            analisarConsumoCliente={analisarConsumoCliente}
          />
        );
      case 'caixa':
        return (
          <CaixaSection
            caixa={caixaAberto}
            usuario={usuarioLogado!}
            onAbrirCaixa={abrirCaixa}
            onFecharCaixa={fecharCaixa}
            onAddMovimentacao={addMovimentacao}
          />
        );
      case 'despesas':
        return (
          <DespesasSection
            despesas={despesas}
            caixa={caixaAberto}
            usuario={usuarioLogado}
            onAddDespesa={addDespesa}
            onDeleteDespesa={deleteDespesa}
            onAddMovimentacaoCaixa={addMovimentacao}
          />
        );
      case 'relatorios':
        return (
          <RelatoriosSection
            vendas={vendas}
            clientes={clientes}
            produtos={produtos}
            caixas={caixas}
            despesas={despesas}
          />
        );
      case 'configuracoes':
        return (
          <ConfiguracoesSection
            configuracoes={configuracoes}
            usuarios={usuarios}
            usuarioLogado={usuarioLogado}
            onUpdateConfiguracoes={updateConfiguracoes}
            onAddUsuario={addUsuario}
            onUpdateUsuario={updateUsuario}
            onDeleteUsuario={deleteUsuario}
          />
        );
      default:
        return <Dashboard 
          produtos={produtos}
          vendas={vendas}
          clientes={clientes}
          caixa={caixaAberto}
          onTelaChange={(tela) => setTelaAtual(tela as Tela)}
        />;
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!logado) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      usuario={usuarioLogado!}
      onLogout={handleLogout}
      telaAtual={telaAtual}
      onTelaChange={setTelaAtual}
    >
      {renderTela()}
    </Layout>
  );
}

export default App;
