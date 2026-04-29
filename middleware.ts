import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Keep auth refresh scoped to admin routes only.
  // Running session refresh on every public page request adds noticeable latency in dev
  // (and unnecessary load in prod) for a mostly-static marketing menu.
  matcher: ["/admin", "/admin/:path*"],
};
