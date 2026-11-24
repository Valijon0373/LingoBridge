import React, { Suspense } from "react";
import { getActiveServicesSafe } from "@/lib/services-loader";
import { paymentService } from "@/lib/payments/service";
import { OrderWizard } from "@/components/order/OrderWizard";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const [services, paymentMethods] = await Promise.all([
    getActiveServicesSafe(),
    paymentService.getAvailableMethods(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense>
        <OrderWizard
          initialServices={services}
          paymentMethods={paymentMethods}
        />
      </Suspense>
    </div>
  );
}
