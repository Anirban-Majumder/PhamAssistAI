import { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { useContext } from "react";
import { SessionContext } from "@/lib/supabase/usercontext";

export default function Dashboard() {
  const session = useContext(SessionContext);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard, {session?.user?.email || 'user'}!</h1>
      </div>
    </Layout>
  );
}