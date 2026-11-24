import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/service";

export async function GET() {
  const methods = await paymentService.getAvailableMethods();
  return NextResponse.json({ methods });
}
