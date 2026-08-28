"use client";

import {
  useEffect,
  useState,
} from "react";

type AutoDismissMessageProps = {
  message: string;
  type?: "success" | "error";
  duration?: number;
};

export default function AutoDismissMessage({
  message,
  type = "success",
  duration = 3000,
}: AutoDismissMessageProps) {
  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`mb-6 rounded-[20px] px-5 py-4 text-sm font-medium leading-6 ${
        type === "success"
          ? "status-success"
          : "status-danger"
      }`}
    >
      {message}
    </div>
  );
}