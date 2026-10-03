import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { InvoiceParserService } from "../services/invoce/invoice-parser.service";
import { InvoiceFileStorage } from "../services/invoce/invoice-file.storage";
export class InvoiceController {
  /**
   * Endpoint de upload e leitura de Nota Fiscal (XML ou PDF)
   * POST /api/invoices/parse
   */
  static async parse(req: Request, res: Response) {
    try {
      // 1. Recebimento de arquivo via upload multipart/form-data
      if (req.file) {
        const resource = await InvoiceParserService.parseInvoice({
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
        });

        const storedFile = await InvoiceFileStorage.save(
          req.file.buffer,
          req.file.originalname,
          resource.metadados.tipoArquivo,
        );
        try {
          await prisma.notaFiscal.create({
            data: {
              numero_nf: resource.identificacao.numero,
              serie: resource.identificacao.serie,
              modelo: resource.identificacao.modelo,
              natureza_operacao: resource.identificacao.naturezaOperacao,
              tipo_operacao: resource.identificacao.tipoOperacao,
              data_emissao: InvoiceController.parseDate(resource.identificacao.dataEmissao),
              chave_acesso: resource.identificacao.chaveAcesso,
              tipo_arquivo: resource.metadados.tipoArquivo,
              nome_arquivo: storedFile.originalName,
              caminho_arquivo: storedFile.relativePath,
              mime_type: req.file.mimetype,
              tamanho_bytes: req.file.size,
              dados_completos: JSON.parse(JSON.stringify(resource)),
              arquivo_nf: storedFile.relativePath,
            },
          });
        } catch (error) {
          await InvoiceFileStorage.remove(storedFile.absolutePath);
          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
          ) {
            return res.status(409).json({
              error: "Nota fiscal já cadastrada.",
              details: "Já existe uma nota fiscal com esta chave de acesso.",
              chaveAcesso: resource.identificacao.chaveAcesso,
            });
          }
          throw error;
        }
        return res.status(200).json(resource);
      }
      // 2. Alternativa: envio de XML como string no corpo JSON ({ "xml": "<nfeProc>..." })
      if (req.body && req.body.xml) {
        const resource = InvoiceParserService.parseXmlString(req.body.xml);
        return res.status(200).json(resource);
      }
      return res.status(400).json({
        error: "Nenhum arquivo enviado. Por favor, envie um arquivo .xml ou .pdf no campo 'file' via multipart/form-data ou informe a tag 'xml' no corpo da requisição.",
      });
    } catch (error: any) {
      console.error("Erro ao processar nota fiscal:", error);
      return res.status(422).json({
        error: "Falha ao processar nota fiscal",
        details: error?.message || "Erro desconhecido durante o parsing da nota fiscal.",
      });
    }
  }

  private static parseDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}