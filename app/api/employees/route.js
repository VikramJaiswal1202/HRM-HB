import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Employee from '@/models/employeeModel';

export async function GET() {
  try {
    await connectDB();

    const employees = await Employee.find({}, 'employeeId name'); // only select ID & name

    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees.' },
      { status: 500 }
    );
  }
}
