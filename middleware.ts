// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const exclude = (t: string) =>
  /^\/.*\.(css|svg|ico|jpg|jpeg|json|js|html|gif|png|webp)$|^\/_next.*/gm.test(
    t
  );

interface TableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, string>;
}

const redirect = (req: NextRequest, r?: string) =>
  NextResponse.redirect(r ?? new URL("/", req.url));
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, resp: NextResponse) {
  if (!exclude(request.nextUrl.pathname)) {
    console.log(request.nextUrl.pathname);
    const nano_id = request.nextUrl.pathname.split("/").at(-1);
    if (!nano_id) return;
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const T = setTimeout(controller.abort, 800);
      const { records } = (await fetch(
        `https://api.airtable.com/v0/appk4Lerac1adhrMr/urls?fields%5B%5D=target&filterByFormula={nano_id}='${nano_id}'`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_APIKEY}`,
          },
        }
      ).then((r) => {
        clearTimeout(T);
        return r.json();
      })) as { records: TableRecord[] };

      if (records && records[0] && records[0].fields.target) {
        return redirect(request, records[0].fields.target);
      }
    } catch (e) {
      return redirect(request);
    }
    return redirect(request);
  }
}
