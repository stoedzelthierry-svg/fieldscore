import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const url = `${API_BASE_URL}${pathname}`;
    // Simple proxy: forward the request
    const headers = new Headers(request.headers);
    headers.set("host", new URL(API_BASE_URL).host);

    return NextResponse.rewrite(url, {
      request: { headers },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
