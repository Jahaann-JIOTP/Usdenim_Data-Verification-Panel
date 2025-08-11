import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import MeterName from "@/models/MeterName";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { meterName: string } }
) {
  try {
    await connectDB();

    const uniqueKey = context.params.meterName?.trim();
    if (!uniqueKey) {
      return new Response(
        JSON.stringify({ message: "Unique key not provided" }),
        { status: 400 }
      );
    }

    const meterInfo = await MeterName.findOne(
      { unique_key: uniqueKey },
      { _id: 0, meter_name: 1, location: 1, unique_key: 1 }
    );

    if (!meterInfo) {
      return new Response(
        JSON.stringify({ message: "Meter not found in meter_name collection" }),
        { status: 404 }
      );
    }

    const meterData = await Meter.findOne(
      { unique_key: uniqueKey },
      { _id: 0, parameters: 1, comment: 1 }
    );

    return new Response(
      JSON.stringify({
        unique_key: meterInfo.unique_key,
        meter_name: meterInfo.meter_name,
        location: meterInfo.location,
        comment: meterData?.comment || "",
        parameters: meterData?.parameters || [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching meter:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
