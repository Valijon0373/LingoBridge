"use client";

import React from "react";
import Link from "next/link";
import {
  RiBankCardLine as CreditCard,
  RiDownloadLine as Download,
  RiExternalLinkLine as ExternalLink,
  RiFileCheckLine as FileCheck2,
  RiFileTextLine as FileText,
  RiAddLine as Plus,
  RiBillLine as Receipt,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { getServiceLocalizedName } from "@/lib/i18n/dictionaries";
import { formatDirection, formatUZS, getFileDownloadUrl } from "@/lib/utils";
import type { OrderDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function OrdersList({ orders }: { orders: OrderDTO[] }) {
  const { locale, t } = useI18n();

  if (orders.length === 0) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {t.dashboard.noOrders}
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          {t.dashboard.noOrdersDesc}
        </p>
        <Link href="/order" className="mt-5 inline-block">
          <Button>
            <Plus className="h-4 w-4" />
            {t.dashboard.newOrderBtn}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const latestReceipt = order.payments.find((p) => p.receiptFileKey);
        const originalUrl = getFileDownloadUrl(order.originalFileKey);
        const receiptUrl = getFileDownloadUrl(latestReceipt?.receiptFileKey);
        const translatedUrl = getFileDownloadUrl(order.translatedFileKey);

        return (
          <Card key={order.id} className="p-5 hover:border-slate-300 transition-colors">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-[#1F4E79]">
                    #{order.orderNumber}
                  </span>
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  {getServiceLocalizedName(order.service, locale)}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>{formatDirection(order.sourceLanguage, order.targetLanguage, locale)}</span>
                  <span>•</span>
                  <span>
                    {order.pageCount} {t.common.pages}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[220px]">{order.originalFileName}</span>
                </div>

                {order.adminNote && (
                  <p className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700">
                    💬 {order.adminNote}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {formatUZS(order.totalPrice, locale)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatUZS(order.unitPrice, locale)}{" "}
                    {order.pricingType === "PER_PAGE" ? `/ ${t.common.perPage}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {originalUrl && (
                    <a href={originalUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <FileText className="h-3.5 w-3.5" />
                        {t.dashboard.originalDoc}
                      </Button>
                    </a>
                  )}

                  {receiptUrl && (
                    <a href={`${receiptUrl}?inline=1`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <Receipt className="h-3.5 w-3.5" />
                        {t.dashboard.receiptDoc}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}

                  {(order.status === "WAITING_PAYMENT" || order.status === "PENDING") && (
                    <Link href={`/order?payOrderId=${encodeURIComponent(order.id)}`}>
                      <Button size="sm">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t.dashboard.payNow}
                      </Button>
                    </Link>
                  )}

                  {order.status === "COMPLETED" && translatedUrl && (
                    <a href={translatedUrl}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <FileCheck2 className="h-3.5 w-3.5" />
                        {t.dashboard.downloadTranslation}
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
