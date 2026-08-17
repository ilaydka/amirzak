"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "DEALER", "ADMIN"]),
});

export async function updateUserRole(formData: FormData) {
  const admin = await requireAdmin();

  const result = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!result.success) {
    redirect("/admin/users?error=invalid");
  }

  const { userId, role } = result.data;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/admin/users?error=not-found");
  }

  if (user.id === admin.id && role !== "ADMIN") {
    redirect("/admin/users?error=self-role");
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      redirect("/admin/users?error=last-admin");
    }
  }

  if (user.role === role) {
    redirect("/admin/users?error=same-role");
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("UPDATE_USER_ROLE_ERROR:", error);

    redirect("/admin/users?error=1");
  }

  redirect("/admin/users?updated=1");
}