"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import ImageUpload from "@/components/img-upload";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTheme } from "next-themes";

interface Medicine {
  id?: number;
  name: string;
  dosage: string;
  duration: string;
}

export default function Dashboard() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const router = useRouter();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [openMedicine, setOpenMedicine] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Record<string, Date[]>>({});

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!session?.user?.id) {
        setFirstName("User");
        return;
      }
      const { data, error } = await supabase
        .from("profile")
        .select("first_name")
        .eq("user_id", session.user.id)
        .single();

      setFirstName(error || !data ? "User" : data.first_name);
    };

    fetchUserFirstName();
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code, router]);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const { data, error } = await supabase
          .from("medicine")
          .select("*")
          .eq("user_id", session?.user?.id);

        if (!error && data) {
          setMedicines(data);
        } else {
          console.error("Error fetching medicines:", error);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchMeds();
  }, [session, supabase]);

  const handleDateChange = (medicineName: string, date: Date) => {
    setSelectedDates((prevDates) => {
      const isSelected = prevDates[medicineName]?.some(
        (d) => d.toDateString() === date.toDateString()
      );

      return {
        ...prevDates,
        [medicineName]: isSelected
          ? prevDates[medicineName]?.filter((d) => d.toDateString() !== date.toDateString()) || []
          : [...(prevDates[medicineName] || []), date],
      };
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Dashboard, {firstName}!</h1>

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

        {/* Medicine Reminder List */}
        <div className="w-full max-w-2xl bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Medicine Reminder</h2>
          {medicines.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-300">No upcoming doses!</p>
          ) : (
            <div className="space-y-2">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id || medicine.name}
                  className="flex justify-between items-center px-4 py-2 rounded-lg border-b border-zinc-300 dark:border-zinc-500 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                  onClick={() => setOpenMedicine(medicine.name)}
                >
                  <h2 className="text-lg font-bold">{medicine.name}</h2>
                  <p className="text-zinc-600 dark:text-zinc-300">{medicine.dosage}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicine-Specific Calendar Modal */}
        {openMedicine && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
              
              {/* Close Button */}
              <button
                onClick={() => setOpenMedicine(null)}
                className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold text-center mb-4">{openMedicine} Schedule</h2>
              <div className="flex justify-center">
                <Calendar
                  onClickDay={(date) => handleDateChange(openMedicine, date)}
                  tileContent={({ date }) =>
                    selectedDates[openMedicine]?.some(
                      (d) => d.toDateString() === date.toDateString()
                    ) ? (
                      <span className="text-cyan-600 dark:text-cyan-400">💊</span>
                    ) : null
                  }
                  className={`rounded-lg shadow-lg transition-all border border-gray-300 dark:border-gray-700 text-base bg-foreground`}
                />
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() => setOpenMedicine(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md"
                >
                  Close
                </button>
                <button
                  onClick={() => setOpenMedicine(null)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
