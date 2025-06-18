import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/dbConnect';
import Intern from '@/models/internModel';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ success: false, error: `Sorry, something went wrong! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.fields([{ name: 'resume' }, { name: 'more' }]));

apiRoute.post(async (req, res) => {
  await connectDB();
  try {
    const { name, email, mobileNumber, roll, department, employeeId } = req.body;
    const resume = req.files?.resume?.[0]?.filename || "";
    const more = req.files?.more?.[0]?.filename || "";

    const intern = new Intern({
      name,
      email,
      mobile: mobileNumber,
      role: roll,
      department,
      employeeId,
      resume,
      more,
    });

    await intern.save();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add intern" });
  }
});

export default apiRoute;