import React from "react";
import { Layout } from "@/components/layout";
import { createClient } from "@/lib/supabase/component";
import { useRouter } from 'next/router';


export default function SignOut() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Layout>
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
            <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Sign out of your account</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Are you sure you want to sign out?</p>
            </div>
            <div className="space-y-4">
            <button onClick={handleSignOut} className="w-full px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:ring focus:ring-red-300">
                Sign Out
            </button>
            </div>
        </div>
    </Layout>
  )};