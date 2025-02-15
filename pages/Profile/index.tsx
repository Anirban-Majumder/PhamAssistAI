"use client"

import { useEffect, useState, useContext } from "react";
import ImageUpload from "@/components/img-upload";
import Symptom from "@/components/symptom-upload";
import { createClient } from "@/lib/supabase/component";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SessionContext } from "@/lib/supabase/usercontext";
import { ImageIcon } from "lucide-react";

interface Medicine {
  id?: number;
  name: string;
  dosage: string;
  duration: string;
}

export default function MedicalProfile() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [Name, setName] = useState<string | null>(null);
  const [email, setemail] = useState<string | null>(null);
  const [symptoms, setsymptoms] = useState<any[]>(["--", "--", "--"]);
  const [pres, setpres] = useState<any[]>([]);


  useEffect(() => {
    const fetchUserName = async () => {

      if (!session?.user?.id) {
        setName("User");
        return;
      }
      const { data, error } = await supabase
        .from("profile")
        .select("first_name,last_name,prescriptions,symptoms")
        .eq("user_id", session.user.id)
        .single();
      if (error || !data) {
        console.warn("No profile found, using email prefix:", error?.message);
        setName("User");
      }
      else {
        setName(data.first_name + " " + data.last_name);
        console.log(data);
        if(data.symptoms){ 
          setsymptoms(data.symptoms.split('*').filter((item: string) => item !== ''));
        }
        if (data.prescriptions){
        setpres(data.prescriptions.split('*').filter((item: string) => item !== ''));}
        setemail(session.user.email || null);
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

    fetchUserName();
    fetchMeds();
  }, [session?.user?.id]);

  return (
    <Layout>
      <div className="w-full h-screen pb-20 overflow-auto p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-pink-700 flex items-center justify-center mb-2">
            <span className="text-6xl text-white font-bold">
              {Name?.charAt(0)}
            </span>
          </div>
          <h1 className="text-3xl font-semibold">{Name}</h1>
        </div>

        <div className="pb-20 grid md:grid-cols-3 gap-6 w-full p-4 rounded-xl border border-gray-500">
          <div className="md:col-span-2 w-full space-y-4 border-r border-gray-400">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Information:</h2>
              <div className="space-y-2">
                <Label className="text-xl">Email:</Label>
                <div className="text-l">{email}</div>
              </div>

              {/* Medicines */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Medicines:</h2>

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
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Prescriptions: <ImageUpload /></h3>
              <div className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide w-full">
                {pres.length>0? (
                  pres
                    .filter((imageUrl) => imageUrl !== " ")
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        className="w-40 h-60 border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      >
                        <img src={imageUrl} alt={`Prescription ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                ) : (
                  // Fallback UI if no images are available
                  [...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="w-40 h-60 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-4 text-xl">
            <div className="md:col-span-1 w-full space-y-4">
              <h3 className="font-semibold">Symptoms: <Symptom/></h3>
              <ul className="list-disc list-inside">
                {symptoms.map((symptom: string, index: number) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>

  )
}