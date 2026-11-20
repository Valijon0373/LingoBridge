import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { AdminLoginScreen } from "@/components/admin/AdminLoginScreen";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginScreen />;
  }

  if (user.role !== "ADMIN") {
    return <AdminLoginScreen nonAdminNotice />;
  }

  return (
    <AdminDashboardShell
      initialAdmin={{
        ...user,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
