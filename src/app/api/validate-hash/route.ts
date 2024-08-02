import { webcrypto } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { hash } = await req.json();

  if (!hash) {
    return NextResponse.json({ error: "Missing required field hash" }, { status: 400 });
  }

  if (!process.env.BOT_TOKEN) {
    return NextResponse.json(
      { error: "Internal server error: BOT_TOKEN is not defined" },
      { status: 500 }
    );
  }

  const data = Object.fromEntries(new URLSearchParams(hash));
  const isValid = await isHashValid(data, process.env.BOT_TOKEN);

  if (isValid) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid hash" }, { status: 403 });
}

async function isHashValid(data: Record<string, string>, botToken: string) {
  const encoder = new TextEncoder();

  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join("\n");

  const secretKey = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );

  const secret = await webcrypto.subtle.sign("HMAC", secretKey, encoder.encode(botToken));

  const signatureKey = await webcrypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );

  const signature = await webcrypto.subtle.sign("HMAC", signatureKey, encoder.encode(checkString));

  const hex = Buffer.from(new Uint8Array(signature)).toString("hex");

  return data.hash === hex;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
