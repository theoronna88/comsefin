"use client";
import { getToken } from "@/app/api/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import LoadingComsefaz from "@/app/_components/comsefaz-loading";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const alreadyCalled = useRef(false);
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      if (code && state) {
        const token = await getToken(code);

        const sessionId = crypto.randomUUID();

        await fetch("/api/store-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: token.access_token, sessionId }),
        });
        document.cookie = `sessionId=${sessionId}; path=/user`;

        router.push("/user/dashboard");
      } else {
        console.error("Código ou estado ausente na URL.");
      }
    }

    if (alreadyCalled.current) return;
    alreadyCalled.current = true;
    handleCallback();
  }, [searchParams, router]);

  return (
    <>
      <LoadingComsefaz width={100} height={100} />
    </>
  );
};

const Callback = () => {
  return (
    <Suspense fallback={<LoadingComsefaz width={100} height={100} />}>
      <CallbackContent />
    </Suspense>
  );
};

export default Callback;
