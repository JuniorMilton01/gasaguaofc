import { useLocalStorage } from './useStorage';
import type { 
  Cliente, 
  Produto, 
  Venda, 
  Caixa, 
  MovimentacaoEstoque,
  Configuracoes,
  Usuario 
} from '@/types';

// Clientes
export function useClientes() {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('gasagua_clientes', []);
  
  const addCliente = (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'saldoDevedor' | 'historicoPedidos' | 'ativo'>) => {
    const novoCliente: Cliente = {
      ...cliente,
      id: crypto.randomUUID(),
      dataCadastro: new Date().toISOString(),
      saldoDevedor: 0,
      historicoPedidos: [],
      ativo: true,
    };
    setClientes(prev => [...prev, novoCliente]);
    return novoCliente;
  };

  const updateCliente = (id: string, dados: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const deleteCliente = (id: string) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ativo: false } : c));
  };

  const getClienteById = (id: string) => {
    return clientes.find(c => c.id === id && c.ativo);
  };

  const getClientesFiado = () => {
    return clientes.filter(c => c.ativo && c.saldoDevedor > 0);
  };

  const addPedidoCliente = (clienteId: string, pedido: any) => {
    setClientes(prev => prev.map(c => {
      if (c.id === clienteId) {
        const historico = [...c.historicoPedidos, pedido];
        const ultimaCompra = pedido.data;
        
        // Calcular média de consumo
        const datas = historico.map(h => new Date(h.data).getTime()).sort((a, b) => a - b);
        let mediaConsumo = c.mediaConsumoDias;
        if (datas.length >= 2) {
          const diferencas = [];
          for (let i = 1; i < datas.length; i++) {
            diferencas.push((datas[i] - datas[i-1]) / (1000 * 60 * 60 * 24));
          }
          mediaConsumo = diferencas.reduce((a, b) => a + b, 0) / diferencas.length;
        }

        return { ...c, historicoPedidos: historico, ultimaCompra, mediaConsumoDias: mediaConsumo };
      }
      return c;
    }));
  };

  const atualizarSaldoDevedor = (clienteId: string, valor: number, operacao: 'adicionar' | 'subtrair') => {
    setClientes(prev => prev.map(c => {
      if (c.id === clienteId) {
        const novoSaldo = operacao === 'adicionar' 
          ? c.saldoDevedor + valor 
          : Math.max(0, c.saldoDevedor - valor);
        return { ...c, saldoDevedor: novoSaldo };
      }
      return c;
    }));
  };

  // Análise inteligente do cliente
  const analisarConsumoCliente = (clienteId: string, todasVendas: Venda[]) => {
    const vendasCliente = todasVendas.filter(v => v.clienteId === clienteId && v.status === 'concluida');
    if (vendasCliente.length === 0) return null;

    // Produtos mais comprados
    const produtosContagem: Record<string, { nome: string; quantidade: number; ultimaCompra: string }> = {};
    vendasCliente.forEach(venda => {
      venda.itens.forEach(item => {
        if (!produtosContagem[item.produtoId]) {
          produtosContagem[item.produtoId] = {
            nome: item.produto.nome,
            quantidade: 0,
            ultimaCompra: venda.data,
          };
        }
        produtosContagem[item.produtoId].quantidade += item.quantidade;
        if (new Date(venda.data) > new Date(produtosContagem[item.produtoId].ultimaCompra)) {
          produtosContagem[item.produtoId].ultimaCompra = venda.data;
        }
      });
    });

    const produtosMaisComprados = Object.entries(produtosContagem)
      .map(([produtoId, data]) => ({ produtoId, ...data }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // Frequência de compra
    const datas = vendasCliente.map(v => new Date(v.data).getTime()).sort((a, b) => a - b);
    let frequenciaDias = 0;
    if (datas.length >= 2) {
      const diferencas = [];
      for (let i = 1; i < datas.length; i++) {
        diferencas.push((datas[i] - datas[i-1]) / (1000 * 60 * 60 * 24));
      }
      frequenciaDias = diferencas.reduce((a, b) => a + b, 0) / diferencas.length;
    }

    // Previsão próxima compra
    const ultimaCompra = new Date(datas[datas.length - 1]);
    const previsaoProximaCompra = new Date(ultimaCompra.getTime() + (frequenciaDias * 24 * 60 * 60 * 1000));

    // Alerta de inatividade (se passou mais de 2x a frequência)
    const hoje = new Date();
    const diasDesdeUltimaCompra = (hoje.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24);
    const alertaInatividade = frequenciaDias > 0 && diasDesdeUltimaCompra > (frequenciaDias * 2);

    return {
      produtosMaisComprados,
      frequenciaDias: Math.round(frequenciaDias),
      previsaoProximaCompra: previsaoProximaCompra.toISOString().split('T')[0],
      alertaInatividade,
    };
  };

  const atualizarAnaliseCliente = (clienteId: string, analise: any) => {
    setClientes(prev => prev.map(c => 
      c.id === clienteId ? { ...c, analiseConsumo: analise } : c
    ));
  };

  return {
    clientes: clientes.filter(c => c.ativo),
    addCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getClientesFiado,
    addPedidoCliente,
    atualizarSaldoDevedor,
    analisarConsumoCliente,
    atualizarAnaliseCliente,
  };
}

// Produtos
export function useProdutos() {
  const [produtos, setProdutos] = useLocalStorage<Produto[]>('gasagua_produtos', []);

  const addProduto = (produto: Omit<Produto, 'id' | 'dataCadastro' | 'ativo'>) => {
    const novoProduto: Produto = {
      ...produto,
      id: crypto.randomUUID(),
      dataCadastro: new Date().toISOString(),
      ativo: true,
    };
    setProdutos(prev => [...prev, novoProduto]);
    return novoProduto;
  };

  const updateProduto = (id: string, dados: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
  };

  const deleteProduto = (id: string) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: false } : p));
  };

  const getProdutoById = (id: string) => {
    return produtos.find(p => p.id === id && p.ativo);
  };

  const atualizarEstoque = (id: string, cheioDelta: number, vazioDelta: number, _motivo: string) => {
    setProdutos(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estoqueCheio: Math.max(0, p.estoqueCheio + cheioDelta),
          estoqueVazio: Math.max(0, p.estoqueVazio + vazioDelta),
        };
      }
      return p;
    }));
  };

  // Devolução de embalagens/cotas - entra no estoque vazio
  const registrarDevolucaoEmbalagem = (id: string, quantidade: number, _motivo: string) => {
    setProdutos(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estoqueVazio: Math.max(0, p.estoqueVazio + quantidade),
        };
      }
      return p;
    }));
  };

  // Troca de produto com defeito - sai do cheio, entra no vazio (como troca)
  const registrarTrocaProduto = (id: string, quantidade: number, _motivo: string) => {
    setProdutos(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estoqueCheio: Math.max(0, p.estoqueCheio - quantidade),
          estoqueVazio: p.estoqueVazio + quantidade, // Entra como vazio (troca)
        };
      }
      return p;
    }));
  };

  // Resto de gás - entra no estoque cheio (com resto)
  const registrarRestoGas = (id: string, quantidade: number, _percentualResto: number) => {
    setProdutos(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estoqueCheio: p.estoqueCheio + quantidade, // Entra como cheio (com resto)
        };
      }
      return p;
    }));
  };

  const getProdutosEstoqueBaixo = () => {
    return produtos.filter(p => p.ativo && p.estoqueCheio <= p.estoqueMinimo);
  };

  return {
    produtos: produtos.filter(p => p.ativo),
    addProduto,
    updateProduto,
    deleteProduto,
    getProdutoById,
    atualizarEstoque,
    registrarDevolucaoEmbalagem,
    registrarTrocaProduto,
    registrarRestoGas,
    getProdutosEstoqueBaixo,
  };
}

// Vendas
export function useVendas() {
  const [vendas, setVendas] = useLocalStorage<Venda[]>('gasagua_vendas', []);

  const addVenda = (venda: Omit<Venda, 'id' | 'data' | 'codigo' | 'status'>) => {
    const novaVenda: Venda = {
      ...venda,
      id: crypto.randomUUID(),
      codigo: `V${Date.now().toString(36).toUpperCase()}`,
      data: new Date().toISOString(),
      status: 'concluida',
    };
    setVendas(prev => [novaVenda, ...prev]);
    return novaVenda;
  };

  const cancelarVenda = (id: string, motivo: string, usuario: string) => {
    setVendas(prev => prev.map(v => v.id === id ? { 
      ...v, 
      status: 'cancelada',
      dataCancelamento: new Date().toISOString(),
      motivoCancelamento: motivo,
      usuarioCancelamento: usuario
    } : v));
  };

  const quitarFiado = (id: string, formaPagamento: 'dinheiro' | 'cartao' | 'pix' | 'fiado') => {
    setVendas(prev => prev.map(v => 
      v.id === id 
        ? { ...v, pago: true, dataPagamento: new Date().toISOString(), formaPagamento } 
        : v
    ));
  };

  const getVendasDoDia = (data?: string) => {
    const hoje = data || new Date().toISOString().split('T')[0];
    return vendas.filter(v => 
      v.data.startsWith(hoje) && v.status === 'concluida'
    );
  };

  const getVendasFiadoPendentes = () => {
    return vendas.filter(v => v.formaPagamento === 'fiado' && !v.pago && v.status === 'concluida');
  };

  const getVendasByCliente = (clienteId: string) => {
    return vendas.filter(v => v.clienteId === clienteId && v.status === 'concluida');
  };

  const getVendasPorPeriodo = (dataInicio: string, dataFim: string) => {
    return vendas.filter(v => {
      const dataVenda = v.data.split('T')[0];
      return dataVenda >= dataInicio && dataVenda <= dataFim && v.status === 'concluida';
    });
  };

  const editarVenda = (id: string, dados: Partial<Venda>) => {
    setVendas(prev => prev.map(v => v.id === id ? { ...v, ...dados } : v));
  };

  return {
    vendas,
    addVenda,
    cancelarVenda,
    quitarFiado,
    getVendasDoDia,
    getVendasFiadoPendentes,
    getVendasByCliente,
    getVendasPorPeriodo,
    editarVenda,
  };
}

// Caixa
export function useCaixa() {
  const [caixas, setCaixas] = useLocalStorage<Caixa[]>('gasagua_caixas', []);

  const getCaixaAberto = () => {
    return caixas.find(c => c.status === 'aberto');
  };

  const abrirCaixa = (funcionario: string, valorAbertura: number) => {
    const caixaAberto = getCaixaAberto();
    if (caixaAberto) {
      throw new Error('Já existe um caixa aberto');
    }

    const novoCaixa: Caixa = {
      id: crypto.randomUUID(),
      dataAbertura: new Date().toISOString(),
      funcionarioAbertura: funcionario,
      valorAbertura,
      totalVendas: 0,
      totalDinheiro: 0,
      totalCartao: 0,
      totalPix: 0,
      totalFiado: 0,
      totalPagamentosFiado: 0,
      totalSangrias: 0,
      totalReforcos: 0,
      status: 'aberto',
      movimentacoes: [{
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        tipo: 'abertura',
        valor: valorAbertura,
        descricao: 'Abertura de caixa',
        usuario: funcionario,
      }],
    };
    setCaixas(prev => [novoCaixa, ...prev]);
    return novoCaixa;
  };

  const fecharCaixa = (id: string, funcionario: string, valorFechamento: number, observacoes?: string) => {
    setCaixas(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          dataFechamento: new Date().toISOString(),
          funcionarioFechamento: funcionario,
          valorFechamento,
          status: 'fechado',
          observacoes,
          movimentacoes: [...c.movimentacoes, {
            id: crypto.randomUUID(),
            data: new Date().toISOString(),
            tipo: 'fechamento',
            valor: valorFechamento,
            descricao: 'Fechamento de caixa',
            usuario: funcionario,
          }],
        };
      }
      return c;
    }));
  };

  const addMovimentacao = (caixaId: string, movimentacao: Omit<Caixa['movimentacoes'][0], 'id' | 'data'>) => {
    setCaixas(prev => prev.map(c => {
      if (c.id === caixaId) {
        const novaMov = { ...movimentacao, id: crypto.randomUUID(), data: new Date().toISOString() };
        
        // Atualizar totais
        let updates: Partial<Caixa> = {};
        if (movimentacao.tipo === 'sangria') {
          updates.totalSangrias = c.totalSangrias + movimentacao.valor;
        } else if (movimentacao.tipo === 'reforco') {
          updates.totalReforcos = c.totalReforcos + movimentacao.valor;
        } else if (movimentacao.tipo === 'pagamento_fiado') {
          updates.totalPagamentosFiado = c.totalPagamentosFiado + movimentacao.valor;
        }

        return {
          ...c,
          ...updates,
          movimentacoes: [...c.movimentacoes, novaMov],
        };
      }
      return c;
    }));
  };

  const registrarVendaCaixa = (caixaId: string, valor: number, formaPagamento: string, pagamentosParciais?: { formaPagamento: string; valor: number }[]) => {
    setCaixas(prev => prev.map(c => {
      if (c.id === caixaId) {
        const updates: Partial<Caixa> = {
          totalVendas: c.totalVendas + valor,
        };

        // Se houver pagamentos parciais (pagamento misto), processar cada um
        if (pagamentosParciais && pagamentosParciais.length > 0) {
          pagamentosParciais.forEach(pag => {
            switch (pag.formaPagamento) {
              case 'dinheiro':
                updates.totalDinheiro = (updates.totalDinheiro || c.totalDinheiro) + pag.valor;
                break;
              case 'cartao':
                updates.totalCartao = (updates.totalCartao || c.totalCartao) + pag.valor;
                break;
              case 'pix':
                updates.totalPix = (updates.totalPix || c.totalPix) + pag.valor;
                break;
              case 'fiado':
                updates.totalFiado = (updates.totalFiado || c.totalFiado) + pag.valor;
                break;
            }
          });
        } else {
          // Pagamento único - comportamento anterior
          switch (formaPagamento) {
            case 'dinheiro':
              updates.totalDinheiro = c.totalDinheiro + valor;
              break;
            case 'cartao':
              updates.totalCartao = c.totalCartao + valor;
              break;
            case 'pix':
              updates.totalPix = c.totalPix + valor;
              break;
            case 'fiado':
              updates.totalFiado = c.totalFiado + valor;
              break;
          }
        }

        return { ...c, ...updates };
      }
      return c;
    }));
  };

  return {
    caixas,
    getCaixaAberto,
    abrirCaixa,
    fecharCaixa,
    addMovimentacao,
    registrarVendaCaixa,
  };
}

// Movimentações de Estoque
export function useMovimentacoesEstoque() {
  const [movimentacoes, setMovimentacoes] = useLocalStorage<MovimentacaoEstoque[]>('gasagua_movimentacoes_estoque', []);

  const addMovimentacao = (movimentacao: Omit<MovimentacaoEstoque, 'id' | 'data'>) => {
    const novaMovimentacao: MovimentacaoEstoque = {
      ...movimentacao,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setMovimentacoes(prev => [novaMovimentacao, ...prev]);
    return novaMovimentacao;
  };

  const getMovimentacoesDoDia = (data?: string) => {
    const hoje = data || new Date().toISOString().split('T')[0];
    return movimentacoes.filter(m => m.data.startsWith(hoje));
  };

  return {
    movimentacoes,
    addMovimentacao,
    getMovimentacoesDoDia,
  };
}

// Despesas
export function useDespesas() {
  const [despesas, setDespesas] = useLocalStorage<any[]>('gasagua_despesas', []);

  const addDespesa = (despesa: any) => {
    const novaDespesa = {
      ...despesa,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    };
    setDespesas(prev => [novaDespesa, ...prev]);
    return novaDespesa;
  };

  const deleteDespesa = (id: string) => {
    setDespesas(prev => prev.filter(d => d.id !== id));
  };

  const getDespesasDoDia = (data?: string) => {
    const hoje = data || new Date().toISOString().split('T')[0];
    return despesas.filter(d => d.data.startsWith(hoje));
  };

  const getDespesasPorPeriodo = (_dataInicio: string, _dataFim: string) => {
    return despesas.filter(d => {
      const dataDespesa = d.data.split('T')[0];
      return dataDespesa >= _dataInicio && dataDespesa <= _dataFim;
    });
  };

  return {
    despesas,
    addDespesa,
    deleteDespesa,
    getDespesasDoDia,
    getDespesasPorPeriodo,
  };
}

// Configurações
export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useLocalStorage<Configuracoes>('gasagua_configuracoes', {
    nomeEmpresa: 'GasAgua Pro',
    cnpj: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    telefone: '',
    email: '',
    mensagemRecibo: 'Obrigado pela preferência!',
    imprimirAutomatico: false,
    estoqueMinimoAlerta: 5,
  });

  const updateConfiguracoes = (dados: Partial<Configuracoes>) => {
    setConfiguracoes(prev => ({ ...prev, ...dados }));
  };

  return {
    configuracoes,
    updateConfiguracoes,
  };
}

// Usuários
export function useUsuarios() {
  const [usuarios, setUsuarios] = useLocalStorage<Usuario[]>('gasagua_usuarios', [
    {
      id: 'admin',
      nome: 'Administrador',
      login: 'admin',
      senha: 'admin123',
      perfil: 'admin',
      ativo: true,
    },
  ]);

  const [usuarioLogado, setUsuarioLogado] = useLocalStorage<Usuario | null>('gasagua_usuario_logado', null);

  const login = (login: string, senha: string): boolean => {
    const usuario = usuarios.find(u => u.login === login && u.senha === senha && u.ativo);
    if (usuario) {
      setUsuarioLogado(usuario);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUsuarioLogado(null);
  };

  const addUsuario = (usuario: Omit<Usuario, 'id' | 'ativo'>) => {
    const novoUsuario: Usuario = {
      ...usuario,
      id: crypto.randomUUID(),
      ativo: true,
    };
    setUsuarios(prev => [...prev, novoUsuario]);
    return novoUsuario;
  };

  const updateUsuario = (id: string, dados: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...dados } : u));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: false } : u));
  };

  return {
    usuarios: usuarios.filter(u => u.ativo),
    usuarioLogado,
    login,
    logout,
    addUsuario,
    updateUsuario,
    deleteUsuario,
  };
}
