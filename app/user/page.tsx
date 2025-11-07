"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "../_components/loading";

const UserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchRedisData = async () => {
      try {
        await fetch("/api/get-redis-data");
      } catch (error) {
        console.error("Erro ao conectar com a API:", error);
      }
    };

    if (session) {
      fetchRedisData();
    }
  }, [session]);

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!session) {
    router.push("/");
  } else if (session) {
    router.push("/user/dashboard");
  }

  return (
    <div>
      <h1>User Page 1</h1>
    </div>
  );
};

export default UserPage;
