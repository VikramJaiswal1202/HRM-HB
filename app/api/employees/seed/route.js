import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Employee from "@/models/employeeModel";

export async function POST() {
  await connectDB();

  const sampleEmployees = [
    { employeeId: "EMP001", name: "Rohit", email: "rohit@example.com", department: "HR" },
    { employeeId: "EMP002", name: "Neha", email: "neha@example.com", department: "Finance" },
    { employeeId: "EMP003", name: "Amit", email: "amit@example.com", department: "IT" },
    { employeeId: "EMP004", name: "Priya", email: "priya@example.com", department: "Marketing" },
    { employeeId: "EMP005", name: "Karan", email: "karan@example.com", department: "Sales" },
  ];

  try {
    await Employee.deleteMany(); // optional: clean first
    const created = await Employee.insertMany(sampleEmployees);
    return NextResponse.json({ success: true, created });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}