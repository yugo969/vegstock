import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

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

  // Supabase認証チェック
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証が必要なパス
  const protectedPaths = ["/dashboard"];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 認証ページ
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 未認証でprotectedPathにアクセス → /loginにリダイレクト
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 認証済みでauthPathにアクセス → /dashboardにリダイレクト
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ルートパス → 認証状況に応じてリダイレクト
  if (req.nextUrl.pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
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
