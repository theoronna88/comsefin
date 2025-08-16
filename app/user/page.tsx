"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingPage from "../_components/loading";

const UserPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!session) {
    router.push("/");
  }

  return (
    <div>
      <h1>User Page 1</h1>
    </div>
  );
};

export default UserPage;
