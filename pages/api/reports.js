import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dbConnect from '../../lib/dbConnect';
import Report from '../../models/Report';

const uploadsDir = path.join(process.cwd(), '/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  })
});

// Helper to run multer
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    await runMiddleware(req, res, upload.single('image'));

    const { employeeId, date, notes } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}`.trim() : null;

    const report = await Report.create({
      employeeId,
      date,
      notes,
      imagePath,
    });

    return res.status(200).json({ success: true, report });
  }

  if (req.method === 'GET') {
    const { employeeId } = req.query;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const reports = await Report.find({ employeeId }).sort({ createdAt: -1 });
    return res.status(200).json(reports);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}