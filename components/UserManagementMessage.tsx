"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserManagementMessageProps = {
  message: string;
  type?: "success" | "error";
};

export default function UserManagementMessage({
  message,
  type = "success",
}: UserManagementMessageProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/admin/users");
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
          ? "mb-6 flex items-center gap-3 rounded-2xl border border-[#b9d9b2] bg-[#e6f4e2] p-5 text-[#356b3b] shadow-sm"
          : "mb-6 flex items-center gap-3 rounded-2xl border border-[#efbdb4] bg-[#fde8e4] p-5 text-[#a33f34] shadow-sm"
      }
    >
      <div
        className={
          type === "success"
            ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4f7a45] font-bold !text-white"
            : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c34f3f] font-bold !text-white"
        }
      >
        {type === "success" ? "✓" : "!"}
      </div>

      <p className="text-sm font-semibold">
        {message}
      </p>
    </div>
  );
}