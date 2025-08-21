import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import MeterName from "@/models/MeterName";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uniqueKey: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    await connectDB();

    const uniqueKey = resolvedParams.uniqueKey?.trim();
    if (!uniqueKey) {
      return NextResponse.json(
        { message: "Unique key not provided" },
        { status: 400 }
      );
    }
    
    const meterInfo = await MeterName.findOne(
      { unique_key: uniqueKey },
      { _id: 0, meter_name: 1, location: 1, unique_key: 1 }
    );
    
    if (!meterInfo) {
      return NextResponse.json(
        { message: "Meter not found in meter_name collection" },
        { status: 404 }
      );
    }
    
    const meterData = await Meter.findOne(
      { unique_key: uniqueKey },
      { _id: 0, parameters: 1, comment: 1 }
    );
    
    return NextResponse.json(
      {
        unique_key: meterInfo.unique_key,
        meter_name: meterInfo.meter_name,
        location: meterInfo.location,
        comment: meterData?.comment || "",
        parameters: meterData?.parameters || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching meter:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
