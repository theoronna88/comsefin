"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "../_components/loading";

const UserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    } else {
      router.push("/user/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingPage />;
  }

  return null;
};

export default UserPage;
