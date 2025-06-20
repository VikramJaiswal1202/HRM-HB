import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/dbConnect';
import Intern from '@/models/internModel';

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
        const moreFile = files.more?.[0];

        const intern = new Intern({
          name: fields.name?.[0],
          email: fields.email?.[0],
          mobileNumber: fields.mobileNumber?.[0],
          roll: fields.roll?.[0],
          department: fields.department?.[0],
          employeeId: fields.employeeId?.[0],
          resumeUrl: resumeFile ? `/uploads/${resumeFile.newFilename}` : '',
          moreFileUrl: moreFile ? `/uploads/${moreFile.newFilename}` : '',
        });

        await intern.save();
        return res.status(200).json({ success: true, intern });
      } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ success: false, error: 'Failed to save intern' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const interns = await Intern.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, interns });
    } catch (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch interns' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
