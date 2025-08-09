import { connectDB } from "@/lib/mongodb";
import MeterName from "@/models/MeterName";

export async function GET() {
  try {
    await connectDB();
    const meters = await MeterName.find({}, { _id: 0 });

    console.log(meters);

    if (!meters || meters.length === 0) {
      return new Response(JSON.stringify({ message: "No meters found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(meters), { status: 200 });
  } catch (error) {
    console.error("Error fetching meters:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch meters" }), {
      status: 500,
    });
  }
}
