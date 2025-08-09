import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
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

    const statusResult = await Meter.updateOne(
      { name: meterName, "parameters.paramName": paramName },
      { $set: { "parameters.$.status": newStatus } }
    );

    let commentResult = null;
    if (comment && comment.trim() !== "") {
      commentResult = await Meter.updateOne(
        { name: meterName },
        { $push: { comments: comment } }
      );
    }

    return new Response(
      JSON.stringify({
        success: statusResult.modifiedCount > 0,
        updatedStatus: newStatus,
        paramName,
        meterName,
        commentAdded: commentResult ? comment : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating parameter status and adding comment:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update parameter status or add comment",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
