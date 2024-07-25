// /pages/api/test.ts
export async function GET(req: Request) {
    return new Response(JSON.stringify({ message: "API is working" }), { status: 200 });
  }