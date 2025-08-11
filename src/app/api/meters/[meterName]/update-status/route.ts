import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import MeterName from "@/models/MeterName";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { meterName: string } }
): Promise<Response> {
  try {
    await connectDB();

    const { meterName } = params;
    const body = await req.json();
    const { paramName, newStatus, comment } = body;

    if (!paramName && typeof comment !== "string") {
      return new Response(
        JSON.stringify({ error: "paramName or comment must be provided" }),
        { status: 400 }
      );
    }

    const meterInfo = await MeterName.findOne(
      { unique_key: meterName.trim() },
      { _id: 0, unique_key: 1 }
    );

    if (!meterInfo) {
      return new Response(
        JSON.stringify({ error: "Meter not found in meter_name collection" }),
        { status: 404 }
      );
    }

    const meter = await Meter.findOne({ unique_key: meterInfo.unique_key });
    if (!meter) {
      return new Response(
        JSON.stringify({ error: "Meter not found in meters collection" }),
        { status: 404 }
      );
    }

    let statusUpdated = false;
    let commentUpdated = false;

    if (paramName && newStatus) {
      const param = meter.parameters.find(
        (p: { paramName: string }) => p.paramName === paramName
      );

      if (!param) {
        return new Response(
          JSON.stringify({ error: `Parameter ${paramName} not found` }),
          { status: 404 }
        );
      }
      if (param.status !== newStatus) {
        param.status = newStatus;
        statusUpdated = true;
      }
    }

    if (typeof comment === "string") {
      const trimmedComment = comment.trim();
      if (meter.comment !== trimmedComment) {
        meter.comment = trimmedComment;
        commentUpdated = true;
      }
    }

    if (!statusUpdated && !commentUpdated) {
      return new Response(
        JSON.stringify({ success: false, message: "Nothing to update" }),
        { status: 200 }
      );
    }

    await meter.save();

    // Build response object dynamically
    const responsePayload: any = { success: true };
    if (statusUpdated)
      responsePayload.updatedStatus = paramName ? newStatus : null;
    if (commentUpdated) responsePayload.updatedComment = meter.comment;

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating parameter status and comment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update parameter status or comment" }),
      { status: 500 }
    );
  }
}
