import pdfParse from "pdf-parse";
import { InvoiceResource } from "../invoice.types";

export class PdfInvoiceParser {
  private static parseNumber(value: string | undefined | null): number {
    if (!value) return 0;
    const parsed = Number(value.replace(/\./g, "").replace(",", ".").trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private static formatDate(value: string | undefined): string {
    if (!value) return "";
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
  }

  private static valueAfter(lines: string[], label: string, offset = 1): string {
    const index = lines.findIndex((line) => line.toUpperCase().includes(label.toUpperCase()));
    if (index < 0) return "";
    if (offset === 1) {
      const inline = lines[index].slice(lines[index].toUpperCase().indexOf(label.toUpperCase()) + label.length).trim();
      if (inline) return inline.replace(/^[:\s-]+/, "").trim();
    }
    return (lines[index + offset] || "").trim();
  }

  private static valueFromLabel(lines: string[], label: string): string {
    const line = lines.find((item) => item.toUpperCase().startsWith(label.toUpperCase()));
    return line ? line.slice(label.length).replace(/^[:\s-]+/, "").trim() : "";
  }

  private static valueInBlock(block: string, label: string, offset = 1): string {
    const lines = block.split(/\r?\n/).map((line) => line.trim());
    return this.valueAfter(lines, label, offset);
  }

  private static cnpj(value: string): string {
    return value.replace(/\D/g, "");
  }

  private static decimal(value: string): number {
    return this.parseNumber(value.replace(/[^\d,.-]/g, ""));
  }

  static async parse(pdfBuffer: Buffer): Promise<InvoiceResource> {
    const data = await pdfParse(pdfBuffer);
    return this.parseFromText(data.text || "");
  }

  static parseFromText(text: string): InvoiceResource {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const key = text.match(/\b\d{4}(?:\s+\d{4}){10}\b/)?.[0].replace(/\D/g, "")
      || text.match(/\b\d{44}\b/)?.[0]
      || "";
    const number = text.match(/N[ºo.]+\s*\n?\s*([\d.]+)/i)?.[1]?.replace(/\D/g, "") || "";
    const serie = text.match(/Série\s+(\d+)/i)?.[1] || "";
    const issueDate = text.match(/DATA DA EMISSÃO\s*\n\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]
      || text.match(/EMISSÃO:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1];
    const total = text.match(/V\. TOTAL DA NOTA\s*\n\s*([\d.,]+)/i)?.[1]
      || text.match(/VALOR TOTAL:\s*R\$\s*([\d.,]+)/i)?.[1];
    const value = this.decimal(total || "");
    const issuerBlock = text.match(/IDENTIFICAÇÃO DO EMITENTE([\s\S]*?)DANFE/i)?.[1] || "";
    const recipientBlock = text.match(/DESTINATÁRIO\s*\/\s*REMETENTE([\s\S]*?)FATURA\s*\/\s*DUPLICATA/i)?.[1] || "";
    const transportBlock = text.match(/TRANSPORTADOR\s*\/\s*VOLUMES TRANSPORTADOS([\s\S]*?)DADOS DOS PRODUTOS/i)?.[1] || "";
    const issuerName = issuerBlock.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0] || "";
    const issuerAddress = issuerBlock.match(/\n([^\n]+,\s*\d+)\n([^\n]+-\s*\d{5}-\d{3})\n([^\n]+-\s*[A-Z]{2})/i);
    const recipientName = this.valueInBlock(recipientBlock, "NOME / RAZÃO SOCIAL");
    const recipientAddress = this.valueInBlock(recipientBlock, "ENDEREÇO");
    const recipientNeighborhood = this.valueInBlock(recipientBlock, "BAIRRO / DISTRITO");
    const recipientCity = this.valueInBlock(recipientBlock, "MUNICÍPIO");
    const recipientUf = this.valueInBlock(recipientBlock, "UF");
    const recipientCep = this.valueInBlock(recipientBlock, "CEP");
    const issuerCnpj = this.valueInBlock(text, "CNPJ / CPF");
    const recipientCnpj = this.valueInBlock(recipientBlock, "CNPJ / CPF");
    const nature = this.valueAfter(lines, "NATUREZA DA OPERAÇÃO");
    const protocol = this.valueAfter(lines, "PROTOCOLO DE AUTORIZAÇÃO DE USO");
    const productsStart = lines.findIndex((line) => line.includes("DADOS DOS PRODUTOS"));
    const additionalStart = lines.findIndex((line) => line.includes("DADOS ADICIONAIS"));
    const productLines = productsStart >= 0
      ? lines.slice(productsStart + 1, additionalStart >= 0 ? additionalStart : lines.length)
      : [];
    const items = this.parseItems(productLines);

    return {
      metadados: { tipoArquivo: "PDF", dataLeitura: new Date().toISOString() },
      identificacao: {
        chaveAcesso: key,
        numero: number,
        serie,
        naturezaOperacao: nature,
        tipoOperacao: "SAIDA",
        dataEmissao: this.formatDate(issueDate),
        protocoloAutorizacao: protocol,
      },
      emitente: {
        razaoSocial: issuerName,
        cnpjCpf: this.cnpj(issuerCnpj),
        inscricaoEstadual: this.valueInBlock(text, "INSCRIÇÃO ESTADUAL"),
        endereco: {
          logradouro: issuerAddress?.[1]?.split(",")[0] || "",
          numero: issuerAddress?.[1]?.match(/,\s*(\d+)/)?.[1] || "",
          bairro: issuerAddress?.[2]?.split(" - ")[0] || "",
          municipio: issuerAddress?.[3]?.split(" - ")[0] || "",
          uf: issuerAddress?.[3]?.match(/-\s*([A-Z]{2})\b/)?.[1] || "",
          cep: issuerAddress?.[2]?.match(/\d{5}-\d{3}/)?.[0] || "",
          telefone: issuerBlock.match(/Fone\/Fax:\s*([\d]+)/i)?.[1],
        },
      },
      destinatario: {
        razaoSocial: recipientName,
        cnpjCpf: this.cnpj(recipientCnpj),
        inscricaoEstadual: this.valueInBlock(recipientBlock, "INSCRIÇÃO ESTADUAL"),
        endereco: {
          logradouro: recipientAddress.replace(/,\s*,/, ","),
          numero: recipientAddress.match(/,\s*(\d+)/)?.[1] || "",
          bairro: recipientNeighborhood,
          municipio: recipientCity,
          uf: recipientUf,
          cep: recipientCep,
          telefone: this.valueAfter(lines, "FONE / FAX"),
        },
      },
      totais: {
        valorProdutos: this.decimal(this.valueAfter(lines, "V. TOTAL PRODUTOS")),
        valorNota: value,
        baseCalculoIcms: this.decimal(this.valueAfter(lines, "BASE DE CÁLC. DO ICMS")),
        valorIcms: this.decimal(this.valueAfter(lines, "VALOR DO ICMS")),
        baseCalculoIcmsSt: this.decimal(this.valueAfter(lines, "BASE DE CÁLC. ICMS S.T.")),
        valorIcmsSt: this.decimal(this.valueAfter(lines, "VALOR DO ICMS SUBST.")),
        valorFrete: this.decimal(this.valueAfter(lines, "VALOR DO FRETE")),
        valorSeguro: this.decimal(this.valueAfter(lines, "VALOR DO SEGURO")),
        valorDesconto: this.decimal(this.valueAfter(lines, "DESCONTO")),
        outrasDespesas: this.decimal(this.valueAfter(lines, "OUTRAS DESPESAS")),
        valorIpi: this.decimal(this.valueAfter(lines, "VALOR TOTAL IPI")),
        valorPis: this.decimal(this.valueAfter(lines, "VALOR DO PIS")),
        valorCofins: this.decimal(this.valueAfter(lines, "VALOR DA COFINS")),
      },
      itens: items,
      cobranca: {
        duplicatas: [{
          numero: this.valueAfter(lines, "Num."),
          vencimento: this.formatDate(this.valueAfter(lines, "Venc.")),
          valor: this.decimal(this.valueAfter(lines, "ValorR$")),
        }],
      },
      transporte: {
        modalidadeFrete: this.valueInBlock(transportBlock, "FRETE"),
        transportadora: {
        razaoSocial: this.valueInBlock(transportBlock, "NOME / RAZÃO SOCIAL"),
        cnpjCpf: this.cnpj(this.valueInBlock(transportBlock, "CNPJ / CPF")),
        endereco: this.valueInBlock(transportBlock, "ENDEREÇO"),
        municipio: this.valueInBlock(transportBlock, "MUNICÍPIO"),
        uf: transportBlock.match(/MUNICÍPIO\s*\n[^\n]+\s*\nUF\s*\n([A-Z]{2})/i)?.[1] || "",
        },
        volumes: {
          quantidade: this.decimal(this.valueInBlock(transportBlock, "QUANTIDADE")),
          especie: this.valueInBlock(transportBlock, "ESPÉCIE"),
          marca: this.valueInBlock(transportBlock, "MARCA"),
          numeracao: this.valueInBlock(transportBlock, "NUMERAÇÃO"),
          pesoBruto: this.decimal(this.valueInBlock(transportBlock, "PESO BRUTO")),
          pesoLiquido: this.decimal(this.valueInBlock(transportBlock, "PESO LÍQUIDO")),
        },
      },
      informacoesAdicionais: {
        informacoesComplementares: this.valueAfter(lines, "INFORMAÇÕES COMPLEMENTARES"),
        informacoesFisco: this.valueAfter(lines, "RESERVADO AO FISCO"),
      },
    };
  }

  private static parseItems(lines: string[]): InvoiceResource["itens"] {
    const result: InvoiceResource["itens"] = [];
    for (let index = 0; index < lines.length; index += 1) {
      let line = lines[index];
      if (/^\d+(?:\.\d+)+[A-ZÀ-Ú]/i.test(line) && !/\d{8}/.test(line)) {
        const nextProductIndex = lines.findIndex(
          (candidate, candidateIndex) => candidateIndex > index && /^\d/.test(candidate) && /\d{8}/.test(candidate),
        );
        if (nextProductIndex >= 0) {
          line += lines[nextProductIndex];
          index = nextProductIndex;
        }
      }
      const match = line.match(/^(\d+(?:\.\d+)+)([A-ZÀ-Ú][A-ZÀ-Ú0-9 /-]*?)(\d{8})(?:\d{3})(\d{4})([A-Z]{2,3})/i);
      if (!match) continue;
      const values = line.slice(match.index! + match[0].length).match(/^(\d+,\d{4})(\d+,\d{2})(\d+,\d{2})/);
      result.push({
        numeroItem: result.length + 1,
        codigo: match[1],
        descricao: match[2].trim(),
        ncm: match[3],
        cst: "",
        cfop: "",
        unidade: match[5],
        quantidade: this.decimal(values?.[1] || ""),
        valorUnitario: this.decimal(values?.[2] || ""),
        valorTotal: this.decimal(values?.[3] || ""),
      });
    }
    return result;
  }
}
