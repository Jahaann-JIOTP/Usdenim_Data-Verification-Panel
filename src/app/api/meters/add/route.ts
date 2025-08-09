import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Invalid Content-Type" }), {
        status: 400,
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Error parsing JSON body:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
      });
    }

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Empty or invalid body" }), {
        status: 400,
      });
    }

    const { name, location, parameters } = body;

    if (!name || !location || !Array.isArray(parameters)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid fields" }),
        { status: 400 }
      );
    }

    const newMeter = new Meter({
      name,
      parameters,
      comments: [],
      location,
    });

    await newMeter.save();

    return new Response(JSON.stringify({ success: true, meter: newMeter }), {
      status: 201,
    });
  } catch (error: any) {
    console.error("Error adding meter:", error.message || error);
    return new Response(JSON.stringify({ error: "Failed to add meter" }), {
      status: 500,
    });
  }
}
