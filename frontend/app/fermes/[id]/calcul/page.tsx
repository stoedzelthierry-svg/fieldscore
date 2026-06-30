"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CalculBasePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/fermes/${params.id}`);
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-500 font-body">Redirection...</p>
    </div>
  );
}
