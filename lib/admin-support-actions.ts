"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const replySchema = z.object({
  ticketId: z.string().trim().min(1),
  message: z
    .string()
    .trim()
    .min(1, "Yanıt boş bırakılamaz.")
    .max(3000, "Yanıt en fazla 3000 karakter olabilir."),
});

const statusSchema = z.object({
  ticketId: z.string().trim().min(1),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "REJECTED",
  ]),
});

const allowedTransitions = {
  OPEN: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: [],
  REJECTED: [],
} as const;

export async function replyToSupportTicket(
  formData: FormData,
) {
  const admin = await requireAdmin();

  const result = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
  });

  if (!result.success) {
    redirect("/admin/support?replyError=invalid");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({
        where: {
          id: result.data.ticketId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
      }

      if (
        ticket.status === "RESOLVED" ||
        ticket.status === "REJECTED"
      ) {
        throw new Error("TICKET_CLOSED");
      }

      await tx.supportReply.create({
        data: {
          ticketId: ticket.id,
          adminId: admin.id,
          message: result.data.message,
        },
      });

      if (ticket.status === "OPEN") {
        await tx.supportTicket.update({
          where: {
            id: ticket.id,
          },
          data: {
            status: "IN_PROGRESS",
          },
        });
      }
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    revalidatePath("/admin");
  } catch (error) {
    console.error("REPLY_SUPPORT_TICKET_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "TICKET_NOT_FOUND") {
        redirect("/admin/support?replyError=not-found");
      }

      if (error.message === "TICKET_CLOSED") {
        redirect("/admin/support?replyError=closed");
      }
    }

    redirect("/admin/support?replyError=1");
  }

  redirect("/admin/support?replied=1");
}

export async function updateSupportStatus(
  formData: FormData,
) {
  await requireAdmin();

  const result = statusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    redirect("/admin/support?statusError=invalid");
  }

  const { ticketId, status } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
      }

      if (ticket.status === status) {
        throw new Error("SAME_STATUS");
      }

      const allowed =
        allowedTransitions[ticket.status].includes(
          status as never,
        );

      if (!allowed) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      await tx.supportTicket.update({
        where: {
          id: ticket.id,
        },
        data: {
          status,
        },
      });
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    revalidatePath("/admin");
  } catch (error) {
    console.error("UPDATE_SUPPORT_STATUS_ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "TICKET_NOT_FOUND") {
        redirect("/admin/support?statusError=not-found");
      }

      if (error.message === "SAME_STATUS") {
        redirect("/admin/support?statusError=same-status");
      }

      if (error.message === "INVALID_STATUS_TRANSITION") {
        redirect("/admin/support?statusError=invalid-transition");
      }
    }

    redirect("/admin/support?statusError=1");
  }

  redirect("/admin/support?statusUpdated=1");
}