import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";

export async function POST() {
  try {
    await connectDB();

    const response = await fetch("http://13.234.241.103:1880/surajcotton");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const liveData = await response.json();

    const meterMap: Record<string, Set<string>> = {};

    for (const key of Object.keys(liveData)) {
      if (["Time", "timestamp", "UNIXtimestamp"].includes(key)) continue;

      const parts = key.split("_");
      if (parts.length < 3) continue;

      const meterName = `${parts[0]}_${parts[1]}`;
      const paramName = parts.slice(2).join("_");

      if (!meterMap[meterName]) {
        meterMap[meterName] = new Set();
      }
      meterMap[meterName].add(paramName);
    }

    let insertedCount = 0;

    for (const [meterName, paramsSet] of Object.entries(meterMap)) {
      const parameters = Array.from(paramsSet).map((p) => ({
        paramName: p,
      }));

      const exists = await Meter.findOne({ name: meterName });
      if (!exists) {
        await Meter.create({
          name: meterName,
          location: "Not Available",
          parameters,
          comments: [],
        });
        insertedCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Inserted ${insertedCount} new meters` }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing meters:", error);
    return new Response(JSON.stringify({ error: "Failed to import meters" }), {
      status: 500,
    });
  }
}
