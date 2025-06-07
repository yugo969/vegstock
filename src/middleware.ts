import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Basic認証チェック（環境変数で制御）
  const enableBasicAuth = process.env.ENABLE_BASIC_AUTH === "true";

  if (enableBasicAuth) {
    const basicAuth = req.headers.get("authorization");

    if (!basicAuth) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    const validUser = process.env.BASIC_AUTH_USER || "admin";
    const validPass = process.env.BASIC_AUTH_PASS || "password";

    if (user !== validUser || pwd !== validPass) {
      return new Response("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }
  }

  // 認証に関するミドルウェア処理を簡略化
  // ルートアクセス時のみリダイレクトを実行し、
  // 認証状態の管理はクライアントサイドに委ねる
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
