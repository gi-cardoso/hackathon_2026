import { XMLParser } from "fast-xml-parser";
import { InvoiceResource } from "../invoice.types";

export class XmlInvoiceParser {
  private static value(node: unknown): string {
    if (node === undefined || node === null) return "";
    if (typeof node === "object" && node !== null && "#text" in node) {
      return String((node as Record<string, unknown>)["#text"] ?? "").trim();
    }
    return String(node).trim();
  }

  private static number(node: unknown): number {
    const value = Number(this.value(node).replace(/\./g, "").replace(",", "."));
    return Number.isNaN(value) ? 0 : value;
  }

  private static array<T>(value: T | T[] | undefined): T[] {
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
  }

  static parse(xmlContent: string | Buffer): InvoiceResource {
    const xml = typeof xmlContent === "string" ? xmlContent : xmlContent.toString("utf8");
    const document = new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(xml);
    const root = document?.nfeProc?.NFe ?? document?.NFe ?? document;
    const info = root?.infNFe ?? {};
    const ide = info.ide ?? {};
    const emit = info.emit ?? {};
    const dest = info.dest ?? {};
    const total = info.total?.ICMSTot ?? {};
    const address = (person: Record<string, unknown>) => ({
      logradouro: this.value(person.xLgr),
      numero: this.value(person.nro),
      bairro: this.value(person.xBairro),
      municipio: this.value(person.xMun),
      uf: this.value(person.UF),
      cep: this.value(person.CEP),
    });

    return {
      metadados: { tipoArquivo: "XML", dataLeitura: new Date().toISOString() },
      identificacao: {
        chaveAcesso: this.value(info["@_Id"]).replace(/^NFe/, ""),
        numero: this.value(ide.nNF),
        serie: this.value(ide.serie),
        modelo: this.value(ide.mod),
        naturezaOperacao: this.value(ide.natOp),
        tipoOperacao: this.value(ide.tpNF) === "0" ? "ENTRADA" : "SAIDA",
        dataEmissao: this.value(ide.dhEmi ?? ide.dEmi),
      },
      emitente: {
        razaoSocial: this.value(emit.xNome),
        nomeFantasia: this.value(emit.xFant),
        cnpjCpf: this.value(emit.CNPJ ?? emit.CPF),
        inscricaoEstadual: this.value(emit.IE),
        endereco: address(emit.enderEmit ?? {}),
      },
      destinatario: {
        razaoSocial: this.value(dest.xNome),
        cnpjCpf: this.value(dest.CNPJ ?? dest.CPF),
        inscricaoEstadual: this.value(dest.IE),
        endereco: address(dest.enderDest ?? {}),
      },
      totais: {
        valorProdutos: this.number(total.vProd),
        valorNota: this.number(total.vNF),
        baseCalculoIcms: this.number(total.vBC),
        valorIcms: this.number(total.vICMS),
        baseCalculoIcmsSt: this.number(total.vBCST),
        valorIcmsSt: this.number(total.vST),
        valorFrete: this.number(total.vFrete),
        valorSeguro: this.number(total.vSeg),
        valorDesconto: this.number(total.vDesc),
        outrasDespesas: this.number(total.vOutro),
        valorIpi: this.number(total.vIPI),
        valorPis: this.number(total.vPIS),
        valorCofins: this.number(total.vCOFINS),
      },
      itens: this.array(info.det).map((detail, index) => {
        const product = detail?.prod ?? {};
        return {
          numeroItem: Number(detail?.["@_nItem"] ?? index + 1),
          codigo: this.value(product.cProd),
          descricao: this.value(product.xProd),
          ncm: this.value(product.NCM),
          cst: this.value(product.CST ?? product.CSOSN),
          cfop: this.value(product.CFOP),
          unidade: this.value(product.uCom),
          quantidade: this.number(product.qCom),
          valorUnitario: this.number(product.vUnCom),
          valorTotal: this.number(product.vProd),
        };
      }),
      cobranca: { duplicatas: [] },
      transporte: { modalidadeFrete: this.value(info.transp?.modFrete) },
    };
  }
}
