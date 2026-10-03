import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export interface StoredInvoiceFile {
  originalName: string;
  relativePath: string;
  absolutePath: string;
}

export class InvoiceFileStorage {
  private static readonly rootDirectory = path.join(process.cwd(), "notas-fiscais");

  static async save(buffer: Buffer, originalName: string, type: "XML" | "PDF"): Promise<StoredInvoiceFile> {
    const extension = type.toLowerCase();
    const directory = path.join(this.rootDirectory, extension);
    await mkdir(directory, { recursive: true });

    const safeName = path.basename(originalName || `nota-${randomUUID()}.${extension}`)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
    const absolutePath = path.join(directory, fileName);
    const relativePath = path.join("notas-fiscais", extension, fileName);

    await writeFile(absolutePath, buffer, { flag: "wx" });
    return { originalName: safeName, relativePath, absolutePath };
  }

  static async remove(absolutePath: string): Promise<void> {
    await unlink(absolutePath);
  }
}
