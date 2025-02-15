import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import ImageUpload from "@/components/img-upload";

export default function Dashboard() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!session?.user?.id) {
        setFirstName("User");
        return;
      }

      // Check if user is from Google provider
      if (session.user.app_metadata.provider === "google") {
        const googleDisplayName = session.user.user_metadata?.full_name?.split(" ")[0];
        if (googleDisplayName) {
          setFirstName(googleDisplayName);
          return;
        }
      } else {
        // Otherwise, fetch from 'profiles' table
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();

        if (error || !data) {
          console.warn("No profile found, using default name:", error?.message);
          setFirstName("User");
        } else {
          setFirstName(data.first_name);
        }
      }
    };

    fetchUserFirstName();
  }, [session?.user?.id, session?.user?.app_metadata, session?.user?.user_metadata, supabase]);

  // Handle query param 'code' from OAuth callback
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code, router]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to the Dashboard, {firstName}!
        </h1>

        {/* Upload Prescription Button */}
      <div className="flex justify-center mb-6 w-full max-w-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full">
          <span>Upload your Prescription</span>
          <ImageUpload />
        </div>
      </div>

      {/* Medicine Tracker Header */}
      <div className="flex items-center mb-4 gap-2 w-full max-w-sm">
        <div className="flex items-center bg-purple-600 text-white px-3 py-2 rounded w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2a6.002 6.002 0 00-5.995 5.775L6 8v.075l-.928 1.91A3 3 0 006 13h12a3 3 0 00.928-5.015L18 8.075V8a6 6 0 00-6-6z" />
            <path
              fillRule="evenodd"
              d="M3 13a1 1 0 011-1h16a1 1 0 011 1v4a5 5 0 01-5 5H8a5 5 0 01-5-5v-4zm5 4a1 1 0 100 2h8a1 1 0 100-2H8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Medicine Tracker</span>
        </div>
      </div>

      {/* Medicine Reminder */}
      <div className="w-full max-w-sm bg-green-900 text-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Medicine Reminder</h2>
        <p className="text-sm mb-2">Upcoming Doses:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="font-medium">Tab Asomex</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2v2m0 16v2m8-8h-2M4 12H2m15.364-5.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l1.414 1.414M6.05 6.05l-1.414 1.414"
              />
            </svg>
          </li>
          <li className="flex items-center gap-2">
            <span className="font-medium">Capsule Cilacar 10</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.59A8 8 0 016.41 2.707a7 7 0 109.883 9.882z" />
            </svg>
          </li>
        </ul>
      </div>
    </div>
    </Layout>
  );
}
