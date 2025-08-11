import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const uniqueKey = searchParams.get("unique_key");

    if (!statusParam || !uniqueKey) {
      return new Response(
        JSON.stringify({
          error: "Both status and unique_key query parameters are required",
        }),
        { status: 400 }
      );
    }

    const statuses = statusParam.split(",").map((s) => s.trim());

    const meter = await Meter.findOne(
      {
        unique_key: uniqueKey,
        "parameters.status": { $in: statuses },
      },
      {
        unique_key: 1,
        name: 1,
        location: 1,
        comment: 1,
        parameters: 1,
      }
    );

    if (!meter) {
      return new Response(
        JSON.stringify({
          error: "Meter not found or no parameters matching status",
        }),
        { status: 404 }
      );
    }

    const filteredParams = meter.parameters.filter((p) =>
      statuses.includes(p.status)
    );

    const result = {
      unique_key: meter.unique_key,
      name: meter.name,
      location: meter.location,
      comment: meter.comment,
      parameters: filteredParams,
    };

    return new Response(JSON.stringify({ success: true, meter: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error filtering meter parameters:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
