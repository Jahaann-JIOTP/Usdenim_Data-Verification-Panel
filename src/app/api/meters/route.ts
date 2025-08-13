import { connectDB } from "@/lib/mongodb";
import MeterName from "@/models/MeterName";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const meters = await MeterName.find({}, { _id: 0 });

    if (!meters || meters.length === 0) {
      return NextResponse.json({ message: "No meters found" }, { status: 404 });
    }

    return NextResponse.json(meters, { status: 200 });
  } catch (error) {
    console.error("Error fetching meters:", error);
    return NextResponse.json(
      { error: "Failed to fetch meters" },
      { status: 500 }
    );
  }
}
