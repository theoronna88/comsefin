"use client";
import { getToken } from "@/app/api/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
        try {
          const tokenData = await getToken(code);

          // Cria a sessão NextAuth com os tokens do Conta Azul
          const result = await signIn("conta-azul", {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            redirect: false,
          });

          if (result?.ok) {
            router.push("/user/dashboard");
          } else {
            console.error("Erro ao criar sessão:", result?.error);
            router.push("/");
          }
        } catch (error) {
          console.error("Erro no callback:", error);
          router.push("/");
        }
      } else {
        console.error("Código ou estado ausente na URL.");
        router.push("/");
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
