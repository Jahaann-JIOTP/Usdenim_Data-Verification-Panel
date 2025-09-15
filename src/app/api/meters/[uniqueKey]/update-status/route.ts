import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uniqueKey: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    await connectDB();

    const uniqueKey = resolvedParams.uniqueKey?.trim();
    if (!uniqueKey) {
      return NextResponse.json(
        { error: "Unique key not provided" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paramName, newStatus, comment } = body;

    if (!paramName && typeof comment !== "string") {
      return NextResponse.json(
        { error: "paramName or comment must be provided" },
        { status: 400 }
      );
    }

    const meter = await Meter.findOne({ unique_key: uniqueKey });
    if (!meter) {
      return NextResponse.json(
        { error: "Meter not found in meters collection" },
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
        return NextResponse.json(
          { error: `Parameter ${paramName} not found` },
          { status: 404 }
        );
      }
      if (param.status !== newStatus) {
        param.status = newStatus;
        statusUpdated = true;
        meter.statusUpdatedAt = new Date();
      }
    }

    if (typeof comment === "string") {
      const trimmedComment = comment.trim();
      if (meter.comment !== trimmedComment) {
        meter.comment = trimmedComment;
        commentUpdated = true;
        meter.commentUpdatedAt = new Date();
      }
    }

    if (!statusUpdated && !commentUpdated) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 200 }
      );
    }

    await meter.save();

    const responsePayload: any = { success: true };
    if (statusUpdated){ 
      responsePayload.updatedStatus = newStatus;
      responsePayload.statusUpdatedAt = meter.statusUpdatedAt;
    }
    if (commentUpdated){
      responsePayload.updatedComment = meter.comment;
    responsePayload.commentUpdatedAt = meter.commentUpdatedAt;
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Error updating parameter status and comment:", error);
    return NextResponse.json(
      { error: "Failed to update parameter status or comment" },
      { status: 500 }
    );
  }
}
