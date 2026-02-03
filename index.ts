// Tipos do Sistema GasAgua Pro

export type FormaPagamento = 'dinheiro' | 'cartao' | 'pix' | 'fiado';
export type TipoProduto = 'gas_cozinha' | 'gas_empilhadeira' | 'gas_industrial' | 'agua_20l' | 'agua_10l' | 'agua_garrafinha' | 'outros';
export type StatusVenda = 'concluida' | 'pendente' | 'cancelada';
export type TipoMovimentacao = 'entrada' | 'saida';
export type TipoCaixa = 'abertura' | 'fechamento' | 'sangria' | 'reforco' | 'venda' | 'pagamento_fiado' | 'despesa';

// Pagamento misto - múltiplas formas de pagamento
export interface PagamentoParcial {
  formaPagamento: FormaPagamento;
  valor: number;
}

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpfCnpj?: string;
  endereco?: Endereco;
  dataCadastro: string;
  observacoes?: string;
  limiteCredito?: number;
  saldoDevedor: number;
  ultimaCompra?: string;
  mediaConsumoDias?: number;
  historicoPedidos: HistoricoPedido[];
  ativo: boolean;
  // Análise inteligente
  analiseConsumo?: AnaliseConsumoCliente;
}

export interface AnaliseConsumoCliente {
  produtosMaisComprados: { produtoId: string; nome: string; quantidadeTotal: number; ultimaCompra: string }[];
  frequenciaDias: number;
  previsaoProximaCompra?: string;
  alertaInatividade?: boolean;
}

export interface HistoricoPedido {
  idVenda: string;
  data: string;
  produtos: ItemVenda[];
  valorTotal: number;
  formaPagamento: FormaPagamento;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: TipoProduto;
  precoVenda: number;
  precoCusto: number;
  estoqueCheio: number;
  estoqueVazio: number;
  estoqueMinimo: number;
  unidade: string;
  ativo: boolean;
  dataCadastro: string;
  // Campos específicos para gás
  retornaVazio?: boolean;
  // Campos específicos para água
  vendeCompleta?: boolean;
  precoGalao?: number;
}

export interface ItemVenda {
  id: string;
  produtoId: string;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  retornaVazio?: boolean;
  vendeCompleta?: boolean;
}

export interface Venda {
  id: string;
  codigo: string;
  data: string;
  clienteId?: string;
  cliente?: Cliente;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  taxaEntrega: number;
  valorTotal: number;
  formaPagamento: FormaPagamento;
  // Pagamento misto - quando houver múltiplas formas de pagamento
  pagamentosParciais?: PagamentoParcial[];
  status: StatusVenda;
  observacoes?: string;
  // Entrega
  ehEntrega: boolean;
  enderecoEntrega?: string;
  taxaEntregaValor: number;
  // Controle
  entregador?: string;
  dataEntrega?: string;
  pago: boolean;
  dataPagamento?: string;
  // Cancelamento
  dataCancelamento?: string;
  motivoCancelamento?: string;
  usuarioCancelamento?: string;
  // Devolução de embalagens
  devolucoesEmbalagem?: DevolucaoEmbalagem[];
  // Troca de produtos
  trocaProduto?: TrocaProduto;
  // Resto de gás
  restoGas?: RestoGas;
}

// Devolução de embalagens/cotas
export interface DevolucaoEmbalagem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorCredito: number; // Valor do crédito dado pela devolução
}

// Troca de produto com defeito
export interface TrocaProduto {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  motivo: string;
  novoProdutoId: string;
  novoProdutoNome: string;
}

// Registro de resto de gás
export interface RestoGas {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  percentualResto: number; // Percentual de gás restante (ex: 30%)
  valorCredito: number; // Valor do crédito dado pelo resto
}

export interface MovimentacaoEstoque {
  id: string;
  data: string;
  produtoId: string;
  produto: Produto;
  tipo: TipoMovimentacao;
  quantidadeCheio: number;
  quantidadeVazio: number;
  motivo: string;
  vendaId?: string;
  usuario: string;
}

export interface Caixa {
  id: string;
  dataAbertura: string;
  dataFechamento?: string;
  funcionarioAbertura: string;
  funcionarioFechamento?: string;
  valorAbertura: number;
  valorFechamento?: number;
  totalVendas: number;
  totalDinheiro: number;
  totalCartao: number;
  totalPix: number;
  totalFiado: number;
  totalPagamentosFiado: number;
  totalSangrias: number;
  totalReforcos: number;
  status: 'aberto' | 'fechado';
  movimentacoes: MovimentacaoCaixa[];
  observacoes?: string;
}

export interface MovimentacaoCaixa {
  id: string;
  data: string;
  tipo: TipoCaixa;
  valor: number;
  descricao: string;
  usuario: string;
}

export interface RelatorioDiario {
  data: string;
  caixa: Caixa;
  totalVendas: number;
  quantidadeVendas: number;
  vendasPorFormaPagamento: Record<FormaPagamento, number>;
  vendasPorProduto: { produto: string; quantidade: number; valor: number; tipo: string }[];
  clientesFiado: { cliente: Cliente; valor: number }[];
  clientesPix: { cliente: Cliente; valor: number }[]; // Clientes que pagaram com PIX
  estoqueAtual: { produto: string; cheio: number; vazio: number }[];
  despesas: Despesa[];
  // Novos campos para relatório detalhado
  detalhamentoPorUsuario?: Record<string, {
    totalVendas: number;
    quantidadeVendas: number;
    vendasPorFormaPagamento: Record<FormaPagamento, number>;
  }>;
  devolucoesEmbalagem: { produto: string; quantidade: number; valorTotal: number }[];
  trocasProduto: { produto: string; quantidade: number; motivo: string }[];
  restosGas: { produto: string; quantidade: number; percentualMedio: number; valorTotal: number }[];
}

export interface Despesa {
  id: string;
  data: string;
  valor: number;
  motivo: string;
  descricao?: string;
  categoria: 'despesa' | 'manutencao' | 'combustivel' | 'salario' | 'outros';
  usuario: string;
}

export interface Configuracoes {
  nomeEmpresa: string;
  cnpj: string;
  endereco: Endereco;
  telefone: string;
  email: string;
  logo?: string;
  mensagemRecibo: string;
  imprimirAutomatico: boolean;
  estoqueMinimoAlerta: number;
}

export interface Usuario {
  id: string;
  nome: string;
  login: string;
  senha: string;
  perfil: 'admin' | 'operador';
  ativo: boolean;
}
