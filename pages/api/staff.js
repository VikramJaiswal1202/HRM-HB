import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/dbConnect';
import Staff from '@/models/staffModel';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  const uploadDir = path.join(process.cwd(), 'public/uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (req.method === 'POST') {
    const form = new IncomingForm({ uploadDir, keepExtensions: true, multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ success: false, error: 'Form parsing error' });
      }

      try {
        const resumeFile = files.resume?.[0];
        const documentsFile = files.documents?.[0];

        const staff = new Staff({
          name: fields.name?.[0],
          email: fields.email?.[0],
          mobileNumber: fields.mobileNumber?.[0],
          department: fields.department?.[0],
          designation: fields.designation?.[0],
          employeeId: fields.employeeId?.[0],
          resumeUrl: resumeFile ? `/uploads/${resumeFile.newFilename} `: '',
          documentsUrl: documentsFile ? `/uploads/${documentsFile.newFilename} `: '',
        });

        await staff.save();
        return res.status(200).json({ success: true, staff });
      } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ success: false, error: 'Failed to save staff' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const staffList = await Staff.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, staffList });
    } catch (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch staff list' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}