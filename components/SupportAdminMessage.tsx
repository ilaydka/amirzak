"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SupportAdminMessageProps = {
  message: string;
  type?: "success" | "error";
};

export default function SupportAdminMessage({
  message,
  type = "success",
}: SupportAdminMessageProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/admin/support");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={
        type === "success"
          ? "mb-6 rounded-2xl border border-green-800 bg-green-950 p-5 text-green-300"
          : "mb-6 rounded-2xl border border-red-800 bg-red-950 p-5 text-red-300"
      }
    >
      {message}
    </div>
  );
}