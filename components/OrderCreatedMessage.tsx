"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderCreatedMessage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/orders");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) {
    return null;
  }

  return (
    <div className="status-success mb-6 flex items-start gap-3 rounded-2xl p-5 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3f6b46] text-sm font-bold text-white">
        ✓
      </div>

      <div>
        <p className="font-semibold">
          Siparişiniz başarıyla oluşturuldu.
        </p>

        <p className="mt-1 text-sm opacity-80">
          Siparişiniz hesabınıza kaydedildi ve durumunu bu sayfadan takip edebilirsiniz.
        </p>
      </div>
    </div>
  );
}