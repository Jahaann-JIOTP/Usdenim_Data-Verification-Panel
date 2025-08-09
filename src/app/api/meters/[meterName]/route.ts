import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { meterName: string } }
) {
  try {
    await connectDB();

    const { meterName } = context.params;

    const meter = await Meter.findOne(
      { name: meterName },
      { _id: 0, parameters: 1 }
    );

    if (!meter) {
      return new Response(JSON.stringify({ message: "Meter not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(meter.parameters), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching meter parameters:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
