import { connectDB } from "@/lib/mongodb";
import Meter from "@/models/Meter";
import MeterName from "@/models/MeterName";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    const response = await fetch("http://13.234.241.103:1880/prime_cold1");
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    const liveData = await response.json();
    const meterMap: Record<string, Set<string>> = {};

    // 🔹 Step 1: Split keys into uniqueKey and parameters
    for (const key of Object.keys(liveData)) {
      if (
        [
          "Time",
          "timestamp",
          "UNIXtimestamp",
          "PLC_DATE_AND_TIME",
          "_id",
          "_msgid",
        ].includes(key)
      )
        continue;

      const parts = key.split("_");
      if (parts.length < 2) continue;

      const uniqueKey = parts[0]; // just U1, U2, etc.
      const paramName = parts.slice(1).join("_");

      if (!meterMap[uniqueKey]) {
        meterMap[uniqueKey] = new Set();
      }
      meterMap[uniqueKey].add(paramName);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    // 🔹 Step 2: Insert or Update Meters
    for (const [uniqueKey, paramsSet] of Object.entries(meterMap)) {
      const parameters = Array.from(paramsSet).map((p) => ({ paramName: p }));

      const meter = await Meter.findOne({ unique_key: uniqueKey });

      if (!meter) {
        // New meter
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
      } else {
        // Existing meter → update only missing parameters
        let updated = false;

        for (const p of parameters) {
          const exists = meter.parameters.find(
            (x: { paramName: string }) => x.paramName === p.paramName
          );
          if (!exists) {
            //  Add new parameter with default status
            meter.parameters.push({ paramName: p.paramName });
            updated = true;
          }
        }

        if (updated) {
          await meter.save();
          updatedCount++;
        }
      }
    }

    return NextResponse.json(
      { message: `Inserted ${insertedCount}, Updated ${updatedCount}` },
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
