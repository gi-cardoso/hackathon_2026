import multer from "multer";
const storage = multer.memoryStorage();
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/xml",
    "text/xml",
    "application/x-xml",
  ];
  const hasValidExt = /\.(pdf|xml)$/i.test(file.originalname);
  const hasValidMime = allowedMimes.includes(file.mimetype);
  if (hasValidExt || hasValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Formato de arquivo inválido. Apenas arquivos .xml ou .pdf são permitidos."));
  }
};
export const uploadInvoice = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // Limite de 15MB
  },
  fileFilter,
});