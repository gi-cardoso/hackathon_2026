export interface InvoiceResource {
  metadados: {
    tipoArquivo: 'XML' | 'PDF';
    versaoLayout?: string;
    dataLeitura: string;
  };
  identificacao: {
    chaveAcesso: string;              // 44 dígitos
    numero: string;                   // Ex: "442432" ou "735923"
    serie: string;                    // Ex: "4" ou "000"
    modelo?: string;                  // Ex: "55"
    naturezaOperacao: string;         // Ex: "VENDA PROD ESTABELECIMENTO"
    tipoOperacao: 'ENTRADA' | 'SAIDA';
    dataEmissao: string;
    dataSaidaEntrada?: string;
    protocoloAutorizacao?: string;    // Ex: "243240233717137 - 17/12/2024 16:45:37"
  };
  emitente: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpjCpf: string;
    inscricaoEstadual?: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
      telefone?: string;
    };
  };
  destinatario: {
    razaoSocial: string;
    cnpjCpf: string;
    inscricaoEstadual?: string;
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
      telefone?: string;
    };
  };
  totais: {
    valorProdutos: number;
    valorNota: number;
    baseCalculoIcms: number;
    valorIcms: number;
    baseCalculoIcmsSt: number;
    valorIcmsSt: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    outrasDespesas: number;
    valorIpi: number;
    valorPis: number;
    valorCofins: number;
  };
  itens: Array<{
    numeroItem: number;
    codigo: string;
    descricao: string;
    ncm: string;
    cst: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    valorDesconto?: number;
    baseIcms?: number;
    valorIcms?: number;
    valorIpi?: number;
    aliquotaIcms?: number;
    aliquotaIpi?: number;
    informacoesAdicionais?: string;
  }>;
  cobranca: {
    faturas?: Array<{
      numero: string;
      valorOriginal?: number;
      valorLiquido?: number;
    }>;
    duplicatas: Array<{
      numero: string;
      vencimento: string;
      valor: number;
    }>;
  };
  transporte: {
    modalidadeFrete: string;
    transportadora?: {
      razaoSocial?: string;
      cnpjCpf?: string;
      inscricaoEstadual?: string;
      endereco?: string;
      municipio?: string;
      uf?: string;
    };
    volumes?: {
      quantidade?: number;
      especie?: string;
      marca?: string;
      numeracao?: string;
      pesoBruto?: number;
      pesoLiquido?: number;
    };
  };
  informacoesAdicionais?: {
    informacoesComplementares?: string;
    informacoesFisco?: string;
  };
}