import { NextRequest, NextResponse } from "next/server";

const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const backendUrl = `${backendBase.replace(/\/$/, "")}/tasks/reorder`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Failed to reach backend" }, { status: 500 });
  }
}
