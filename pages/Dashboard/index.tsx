import { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      // Replace the URL with no query params using Next.js router
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard</h1>
      </div>
    </Layout>
  );
}