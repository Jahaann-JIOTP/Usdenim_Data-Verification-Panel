import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import MeterName from "@/models/MeterName";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();
    
    const response = await fetch("http://13.234.241.103:1880/usdenim");
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }
    
    const liveData = await response.json();
    const meterMap: Record<string, Set<string>> = {};
    
    for (const key of Object.keys(liveData)) {
      if (["Time", "timestamp", "UNIXtimestamp"].includes(key)) continue;
      
      const parts = key.split("_");
      if (parts.length < 3) continue;
      const uniqueKey = `${parts[0]}_${parts[1]}_${parts[2]}`;
      const paramName = parts.slice(3).join("_");
      if (!meterMap[uniqueKey]) {
        meterMap[uniqueKey] = new Set();
      }
      meterMap[uniqueKey].add(paramName);
    }
    
    let insertedCount = 0;
    
    for (const [uniqueKey, paramsSet] of Object.entries(meterMap)) {
      const parameters = Array.from(paramsSet).map((p) => ({ paramName: p }));
      const exists = await Meter.findOne({ unique_key: uniqueKey });
      if (!exists) {
        const meterNameDoc = await MeterName.findOne(
          { unique_key: uniqueKey },
          { meter_name: 1, location: 1 }
        );
        
        await Meter.create({
          unique_key: uniqueKey,
          name: meterNameDoc?.meter_name || uniqueKey,
          location: meterNameDoc?.location || "Not Available",
          parameters,
          comment: "",
        });
        
        insertedCount++;
      }
    }
  

    return NextResponse.json(
      { message: `Inserted ${insertedCount} new meters` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing meters:", error);
    return NextResponse.json(
      { error: "Failed to import meters" },
      { status: 500 }
    );
  }
}
