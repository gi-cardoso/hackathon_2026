import { InvoiceResource } from "./invoice.types";
import { XmlInvoiceParser } from "./parsers/xml-invoce.parser";
import { PdfInvoiceParser } from "./parsers/pdf-invoice.parser";
export interface ParseFileInput {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
}
export class InvoiceParserService {
  /**
   * Processa um arquivo de Nota Fiscal (XML ou PDF) e retorna o resource padrão.
   */
  static async parseInvoice(input: ParseFileInput): Promise<InvoiceResource> {
    const { buffer, originalname = "", mimetype = "" } = input;
    if (!buffer || buffer.length === 0) {
      throw new Error("Arquivo vazio ou inválido.");
    }
    const isPdf =
      mimetype.toLowerCase().includes("pdf") ||
      originalname.toLowerCase().endsWith(".pdf") ||
      buffer.subarray(0, 5).toString("ascii").startsWith("%PDF-");
    if (isPdf) {
      return await PdfInvoiceParser.parse(buffer);
    }
    const isXml =
      mimetype.toLowerCase().includes("xml") ||
      originalname.toLowerCase().endsWith(".xml") ||
      buffer.toString("utf-8", 0, Math.min(buffer.length, 100)).includes("<?xml") ||
      buffer.toString("utf-8", 0, Math.min(buffer.length, 200)).includes("<nfeProc") ||
      buffer.toString("utf-8", 0, Math.min(buffer.length, 200)).includes("<NFe");
    if (isXml) {
      return XmlInvoiceParser.parse(buffer);
    }
    throw new Error(
      "Formato de arquivo não suportado. O serviço aceita apenas notas fiscais em formato XML (.xml) ou PDF (.pdf)."
    );
  }

  static parseXmlString(xml: string): InvoiceResource {
    if (!xml || !xml.trim()) {
      throw new Error("XML vazio ou inválido.");
    }
    return XmlInvoiceParser.parse(xml);
  }
}