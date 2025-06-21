import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/dbConnect';
import Report from '@/models/Report';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({ uploadDir, keepExtensions: true });

    form.on('fileBegin', (name, file) => {
      const cleanName = file.originalFilename.replace(/[\s\(\)]+/g, '_'); // clean spaces/brackets
      const fileName = `${Date.now()}_${cleanName}`;
      file.filepath = path.join(uploadDir, fileName);
      file.newFilename = fileName; // store for DB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ success: false, error: 'Form parse error' });
      }

      try {
        const fileObj = files.file;
        const imagePath = fileObj
          ? `/uploads/${fileObj[0].newFilename}`
          : '';

        const report = new Report({
          employeeId: fields.employeeId[0],
          date: fields.date[0],
          notes: fields.notes ? fields.notes[0] : '',
          imagePath,
        });

        await report.save();

        return res.status(200).json({ success: true, report });
      } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ success: false, error: 'Failed to save report' });
      }
    });
  }

  else if (req.method === 'GET') {
    try {
      const { employeeId } = req.query;
      const query = employeeId ? { employeeId } : {};
      const reports = await Report.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, reports });
    } catch (error) {
      console.error('Fetch error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
  }

  else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
