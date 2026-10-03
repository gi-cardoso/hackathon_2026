import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { uploadInvoice } from "../middlewares/upload.middleware";
const invoiceRouter = Router();
// Rota para upload e leitura de notas fiscais (XML ou PDF)
invoiceRouter.post("/parse", uploadInvoice.single("file"), InvoiceController.parse);
export { invoiceRouter };