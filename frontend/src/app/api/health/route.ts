import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      instance: process.env.INSTANCE_ID || "unknown",
    },
    { status: 200 }
  );
}
