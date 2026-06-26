//src/services/officeStaffService.js
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import OfficeStaff from "@/models/OfficeStaff";

export async function createOfficeStaff(data) {
  await connectMongoDB();

  const {
    employeeId,
    name,
    email,
    password,
    designation,
    mobile,
    collegeId,
    createdBy,
  } = data;

  // Required fields
  if (
    !employeeId ||
    !name ||
    !email ||
    !password ||
    !designation ||
    !collegeId
  ) {
    throw new Error("Required fields are missing");
  }

  // Employee ID check
  const employeeExists = await OfficeStaff.findOne({ employeeId });

  if (employeeExists) {
    throw new Error("Employee ID already exists");
  }

  // Email check
  const emailExists = await OfficeStaff.findOne({
    email: email.toLowerCase(),
  });

  if (emailExists) {
    throw new Error("Email already exists");
  }

  // Password Hash
  const hashedPassword = await bcrypt.hash(password, 10);

  const officeStaff = await OfficeStaff.create({
    employeeId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    designation,
    mobile,
    collegeId,
    createdBy,
  });

  return officeStaff;
}

export async function getOfficeStaff(collegeId) {
  await connectMongoDB();

  return OfficeStaff.find({
    collegeId,
  })
    .select("-password")
    .populate("collegeId", "name")
    .sort({
      designation: 1,
      name: 1,
    });
}