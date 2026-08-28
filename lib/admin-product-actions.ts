"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return session.user.id;
}

function getProductId(formData: FormData) {
  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId < 1) {
    return null;
  }

  return productId;
}

export async function approveProduct(formData: FormData) {
  await requireAdminUser();

  const productId = getProductId(formData);

  if (!productId) {
    redirect("/admin/products?approvalError=1");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!product) {
    redirect("/admin/products?approvalError=1");
  }

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        approvalStatus: "APPROVED",
        rejectionReason: null,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("APPROVE_PRODUCT_ERROR:", error);

    redirect("/admin/products?approvalError=1");
  }

  redirect("/admin/products?approved=1&view=pending");
}

const rejectionSchema = z
  .string()
  .trim()
  .min(3, "Red sebebi en az 3 karakter olmalıdır.")
  .max(500, "Red sebebi en fazla 500 karakter olabilir.");

export async function rejectProduct(formData: FormData) {
  await requireAdminUser();

  const productId = getProductId(formData);

  if (!productId) {
    redirect("/admin/products?rejectionError=1");
  }

  const reasonResult = rejectionSchema.safeParse(
    formData.get("rejectionReason"),
  );

  if (!reasonResult.success) {
    redirect("/admin/products?rejectionError=reason");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!product) {
    redirect("/admin/products?rejectionError=1");
  }

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        approvalStatus: "REJECTED",
        rejectionReason: reasonResult.data,
        isActive: false,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("REJECT_PRODUCT_ERROR:", error);

    redirect("/admin/products?rejectionError=1");
  }

  redirect("/admin/products?rejected=1&view=pending");
}