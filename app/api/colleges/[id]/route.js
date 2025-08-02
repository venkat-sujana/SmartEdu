// app/api/colleges/[id]/route.js
import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    // Ensure database connection
    await connectMongoDB();

    // Extract and validate the ID parameter
    const { id } = params;
    
    // Debug: Log the received ID
    console.log("Received college ID:", id);

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return NextResponse.json(
        { error: "Invalid college ID format" }, 
        { status: 400 }
      );
    }

    // Find the college by ID
    const college = await College.findById(id).select("name");
    
    // Debug: Log the query result
    console.log("College found:", college);
    
    if (!college) {
      console.log("College not found for ID:", id);
      return NextResponse.json(
        { error: "College not found" }, 
        { status: 404 }
      );
    }

    // Success response
    return NextResponse.json(
      { 
        success: true,
        name: college.name,
        id: college._id 
      }, 
      { status: 200 }
    );

  } catch (error) {
    // Enhanced error logging
    console.error("Error fetching college name:", {
      message: error.message,
      stack: error.stack,
      params: params
    });

    // Check for specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: "Invalid college ID format" }, 
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: "Failed to fetch college name" }, 
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    
    const { id } = params;
    const body = await req.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid college ID format" }, 
        { status: 400 }
      );
    }

    const updatedCollege = await College.findByIdAndUpdate(
      id, 
      { name: body.name }, 
      { new: true, runValidators: true }
    ).select("name");

    if (!updatedCollege) {
      return NextResponse.json(
        { error: "College not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        name: updatedCollege.name,
        id: updatedCollege._id 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { error: "Failed to update college" }, 
      { status: 500 }
    );
  }
}