import { NextRequest, NextResponse } from "next/server";

const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildBackendUrl = (id: string | number) =>
  `${backendBase.replace(/\/$/, "")}/tasks/${id}`;

type ParamsPromise = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: ParamsPromise) {
  try {
    const { id } = await params;
    const body = await req.json();
    const response = await fetch(buildBackendUrl(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Failed to reach backend" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: ParamsPromise) {
  try {
    const { id } = await params;
    const response = await fetch(buildBackendUrl(id), { method: "DELETE" });
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Failed to reach backend" }, { status: 500 });
  }
}
