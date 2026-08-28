"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductSuccessMessageProps = {
  message: string;
  type?: "success" | "error";
};

export default function ProductSuccessMessage({
  message,
  type = "success",
}: ProductSuccessMessageProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/admin/products");
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
          ? "status-success mb-6 rounded-2xl p-5 text-sm font-medium"
          : "status-danger mb-6 rounded-2xl p-5 text-sm font-medium"
      }
    >
      {message}
    </div>
  );
}