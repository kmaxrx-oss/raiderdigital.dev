import { NextResponse } from "next/server";
import {
  getDefaultIdempotencyStore,
  submitProjectRequest,
  type ProjectBrief,
  type SubmitPath,
} from "@/lib/intake";

export const runtime = "nodejs";

/**
 * Project request submit (T1+T2 paths).
 * Requires header Idempotency-Key (P2).
 * Body: { brief, path?: "full"|"graceful_finish"|"contact_first", onReview: true }
 */
export async function POST(req: Request) {
  const key =
    req.headers.get("Idempotency-Key") ||
    req.headers.get("idempotency-key") ||
    "";

  let body: {
    brief?: ProjectBrief;
    path?: SubmitPath;
    onReview?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
        message: "Request body must be JSON.",
        briefPreserved: true,
      },
      { status: 400 },
    );
  }

  const result = submitProjectRequest({
    brief: body.brief as ProjectBrief,
    idempotencyKey: key,
    path: body.path ?? "full",
    onReview: body.onReview === true,
    store: getDefaultIdempotencyStore(),
  });

  if (!result.ok) {
    const status =
      result.error === "MISSING_IDEMPOTENCY_KEY"
        ? 400
        : result.error === "NOT_ELIGIBLE"
          ? 422
          : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
