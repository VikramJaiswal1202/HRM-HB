import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/dbConnect';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  await connectDB();

  const uploadDir = path.join(process.cwd(), 'public/uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({ uploadDir, keepExtensions: true, multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ success: false, error: 'Form parsing error' });
    }

    (async () => {
      try {
        const intern = new Intern({
          name: fields.name?.[0],
          email: fields.email?.[0],
          mobileNumber: fields.mobileNumber?.[0],
          roll: fields.roll?.[0],
          department: fields.department?.[0],
          employeeId: fields.employeeId?.[0],
          resumeUrl: files.resume?.[0]?.newFilename ? `/uploads/${files.resume[0].newFilename}` : '',
          moreFileUrl: files.more?.[0]?.newFilename ? `/uploads/${files.more[0].newFilename}` : '',
        });

        await intern.save();
        return res.status(200).json({ success: true, intern });
      } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ success: false, error: 'Failed to save intern' });
      }
    })();
  });
}