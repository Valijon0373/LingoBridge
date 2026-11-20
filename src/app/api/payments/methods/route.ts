import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/service";

export async function GET() {
  return NextResponse.json({
    methods: paymentService.getAvailableMethods(),
  });
}
