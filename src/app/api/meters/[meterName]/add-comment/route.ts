import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { meterName: string } }
): Promise<Response> {
  try {
    await connectDB();

    const { meterName } = params;
    const formData = await req.formData();
    const text = formData.get("text")?.toString();

    if (!text) {
      return new Response(JSON.stringify({ error: "Invalid comment text" }), {
        status: 400,
      });
    }

    const meter = await Meter.findOne({ name: meterName });
    if (!meter) {
      return new Response(
        JSON.stringify({ error: "Meter not found in database" }),
        { status: 404 }
      );
    }

    meter.comments.push(text);
    await meter.save();

    return new Response(
      JSON.stringify({
        success: true,
        comment: text,
        meterName: meterName,
        // allComments: meter.comments,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return new Response(JSON.stringify({ error: "Failed to add comment" }), {
      status: 500,
    });
  }
}
