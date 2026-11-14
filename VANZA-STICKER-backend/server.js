const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpeg|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Pilih gambar PNG, JPG, atau WebP."));
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/convert", upload.single("sticker"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Pilih gambar dahulu." });
    const output = await sharp(req.file.buffer)
      .rotate()
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toBuffer();

    res.set({
      "Content-Type": "image/webp",
      "Content-Disposition": 'attachment; filename="vanza-sticker.webp"',
      "Cache-Control": "no-store"
    });
    res.send(output);
  } catch (e) {
    res.status(400).json({ error: e.message || "Konversi gagal." });
  }
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Permintaan tidak valid." });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("VANZA STICKER backend aktif");
});
