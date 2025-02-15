import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import ImageUpload from "@/components/img-upload";

interface Medicine {
  id?: number; // Optional if your DB returns an id field.
  name: string;
  dosage: string;
  duration: string;
}

export default function Dashboard() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!session?.user?.id) {
        setFirstName("User");
        return;
      }
        // Otherwise, fetch from 'profile' table
        const { data, error } = await supabase
          .from("profile")
          .select("first_name")
          .eq("user_id", session.user.id)
          .single();

        if (error || !data) {
          console.warn("No profile found, using default name:", error?.message);
          setFirstName("User");
        } else {
          setFirstName(data.first_name);
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

  useEffect(() => {
    if (firstName === "User") {
      const setUserFirstName = async () => {
        if (!session?.user?.id) {
          setFirstName("User");
          return;
        }

        // Check if user is from Google provider
        if (session.user.app_metadata.provider === "google") {
          const fullName = session.user.user_metadata?.full_name || "User";
          const names = fullName.split(" ");
          const firstNameFromGoogle = names[0];
          const lastNameFromGoogle = names.slice(1).join(" ") || "Lastname";

          // Try to fetch the profile
          const { data, error } = await supabase
            .from("profile")
            .select("first_name")
            .eq("user_id", session.user.id)
            .single();

          if (error || !data) {
            // No profile exists, so create one
            const { error: insertError } = await supabase
              .from("profile")
              .insert({
                user_id: session.user.id,
                first_name: firstNameFromGoogle,
                last_name: lastNameFromGoogle,
              });
            if (insertError) {
              console.error("Error inserting profile:", insertError.message);
            } else {
              setFirstName(firstNameFromGoogle);
            }
          }
        }
      };
      const fetchMeds = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("medicine")
            .select("*")
            .eq("user_id", session?.user?.id);
  
          if (error || !data) {
            console.error("Error fetching medicines:", error);
          } else {
            setMedicines(data);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      setUserFirstName();
      fetchMeds();
    }
  }, [firstName, session, supabase]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to the Dashboard, {firstName}!
        </h1>

        <div className="flex justify-center mb-6 w-full max-w-sm relative">
  <div className="group relative">
    <ImageUpload />
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-sm rounded shadow-lg 
      bg-gray-200 text-black dark:bg-gray-800 dark:text-white 
      opacity-0 group-hover:opacity-100 transition-opacity">
      Upload Medicine
    </span>
  </div>
</div>

      <div className="flex items-center mb-4 gap-2 w-full max-w-sm">
        <div className="flex items-center bg-purple-600 text-white px-3 py-2 rounded w-full">
          <span>Medicine Tracker</span>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-2">Medicine Reminder</h2>
        {medicines.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-300">
                    No upcoming doses!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {medicines.map((medicine) => (
                      <div
                      key={medicine.id || medicine.name}
                      className="flex justify-between items-center px-4 py-2 rounded-lg border-b border-zinc-300 dark:border-zinc-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100">
                      <h2 className="text-lg font-bold">{medicine.name}</h2>
                      <p className="text-zinc-600 dark:text-zinc-300">{medicine.dosage}</p>
                    </div>
                    
                    
                    ))}
                  </div>
                )}
        
      </div>
    </div>
    </Layout>
  );
}
