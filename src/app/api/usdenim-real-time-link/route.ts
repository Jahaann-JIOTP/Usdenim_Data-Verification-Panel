export async function GET() {
  try {
    const response = await fetch("http://13.234.241.103:1880/usdenim");

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch data" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = (await response.json()) as unknown;

    return new Response(JSON.stringify(data), {
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