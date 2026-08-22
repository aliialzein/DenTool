import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL is not configured.' },
      { status: 500 },
    );
  }

  const ids = request.nextUrl.searchParams.get('ids') ?? '';
  const response = await fetch(
    `${API_URL}/products/by-ids?ids=${encodeURIComponent(ids)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}