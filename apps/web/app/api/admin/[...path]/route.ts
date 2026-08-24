import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!apiUrl)
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured." },
      { status: 500 },
    );
  const { path } = await context.params;
  const target = `${apiUrl}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  const csrf = request.headers.get("x-csrf-token");
  const type = request.headers.get("content-type");
  if (cookie) headers.set("cookie", cookie);
  if (csrf) headers.set("x-csrf-token", csrf);
  if (type) headers.set("content-type", type);
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text(),
    cache: "no-store",
  });
  const output = new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
  const setCookies = response.headers.getSetCookie?.() ?? [];
  setCookies.forEach((value) => output.headers.append("set-cookie", value));
  return output;
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
