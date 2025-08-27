// export async function GET() {
//   try {
//     const response = await fetch("http://13.234.241.103:1880/usdenim");

//     if (!response.ok) {
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch data" }),
//         { status: 500, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     const data = (await response.json()) as unknown;

//     return new Response(JSON.stringify(data), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     const err = error as Error;
//     return new Response(
//       JSON.stringify({ error: "Server Error", details: err.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }
//=================================================================
export async function GET() {
  try {
    // Fetch both URLs in parallel
    const [res1, res2] = await Promise.all([
      fetch("http://13.234.241.103:1880/usdenim"),
      fetch("http://13.234.241.103:1880/usdenim1"),
    ]);

    // Check for errors
    if (!res1.ok || !res2.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch data",
          status1: res1.status,
          status2: res2.status,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse responses
    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    // Merge responses (data2 can overwrite data1 if keys overlap)
    const mergedData = { ...data1, ...data2 };
console.log("data 1", data1)
console.log("data 1", data2)
    return new Response(JSON.stringify(mergedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: "Server Error", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
