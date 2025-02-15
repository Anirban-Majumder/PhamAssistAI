import { useContext, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SessionContext } from "@/lib/supabase/usercontext";
import Button from "@/components/ui/button";
import ImageUpload from "@/components/img-upload";
import { createClient } from "@/lib/supabase/component";
import { useRouter } from "next/navigation";
import Link from "next/link";
interface Medicine {
  id?: number; // Optional if your DB returns an id field.
  name: string;
  dosage: string;
  duration: string;
}

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const session = useContext(SessionContext);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
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

    // Only fetch if the session is available
    if (session?.user?.id) {
      fetchMeds();
    }
  }, [router, session, supabase]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          My Medicines
        </h1>
        <ImageUpload />

        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : medicines.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              You have not added any medicine.
            </p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div
                key={medicine.id || medicine.name}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {medicine.name}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Dosage:</span> {medicine.dosage}
                </p>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Duration:</span> {medicine.duration}
                </p>
                <Button>
                  <Link href={`/Buy?name=${medicine.name}&pin=null`}>Buy now</Link>
                </Button>
                <div className="mt-4">
                  <Button>View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
