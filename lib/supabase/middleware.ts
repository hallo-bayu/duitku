import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = ["/chat", "/recap", "/achievements", "/profile", "/settings", "/dashboard"].some(
    (p) => path.startsWith(p)
  );

  if (!user && isProtected) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    return NextResponse.redirect(u);
  }

  if (user && (path === "/login" || path === "/register")) {
    const u = request.nextUrl.clone();
    u.pathname = "/chat";
    return NextResponse.redirect(u);
  }

  return response;
}
