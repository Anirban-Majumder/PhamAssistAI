'use client';
import React, { useContext, useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconHome,
  IconPill,
  IconLogin,
  IconUser,
  IconLogout,
  IconMicroscope
} from "@tabler/icons-react";
import "@copilotkit/react-ui/styles.css";
import { CopilotPopup } from "@copilotkit/react-ui";
import { SessionContext } from "@/lib/supabase/usercontext";
import { useCopilotReadable } from "@copilotkit/react-core";
import { createClient } from "@/lib/supabase/component";

export function Layout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstname, setfirstname] = useState<string | null>("there");
  const [userData, setUserData] = useState<{ profile: Record<string, any>; medicines: any[] }>({
    profile: {},
    medicines: []
  });

  useEffect(() => {
    setIsLoggedIn(!!session);
  }, [session]);

  // Fetch user's data on session change.
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("first_name, last_name, symptoms")
        .eq("user_id", session.user.id)
        .single();

      setfirstname(profileData?.first_name);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      const { data: medicinesData, error: medicinesError } = await supabase
        .from("medicine")
        .select("name, dosage, duration, idmed")
        .eq("user_id", session.user.id);

      if (medicinesError) {
        console.error("Error fetching medicines:", medicinesError);
      }
      setUserData({
        profile: profileData || {},
        medicines: medicinesData || []
      });
    };

    fetchUserData();
  }, [session, supabase]);

  // Call the hook at the top level with the userData state.
  useCopilotReadable({
    description: "This is the user's profile and medicines data. This data is used to provide personalized help and suggestions.",
    value: userData
  });

  const dockItems = [
    {
      title: "Dashboard",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Dashboard"
    },
    {
      title: "Medicine",
      icon: (
        <IconPill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Medicine"
    },
    {
      title: "Lab Tests",
      icon: (
        <IconMicroscope className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Labs"
    },
    !isLoggedIn
      ? {
          title: "Sign In",
          icon: (
            <IconLogin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
          ),
          href: "/SignIn"
        }
      : {
          title: "Sign Out",
          icon: (
            <IconLogout className="h-full w-full text-neutral-500 dark:text-neutral-300" />
          ),
          href: "/SignOut"
        },
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Profile"
    }
  ];

  return (
    <div className="w-screen h-screen bg-white dark:bg-black text-black dark:text-neutral-300 overflow-hidden relative">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 h-full overflow-hidden">
        <CopilotPopup
          instructions={
            "You are an AI assistant for a PharmAssistAI that scans prescriptions and provides medication info. Interpret prescriptions, offer detailed med info including dosages and precautions, and answer user queries in concise about their prescriptions and medications clearly and safely. Use the available actions you have to fetch medicine details from the idmed provieded in userdata."
          }
          labels={{
            title: "ChatBot",
            initial: `Hello ${firstname}, How can I help You today?`
          }}
        />
        {children}
      </main>
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <FloatingDock items={dockItems} />
      </div>
    </div>
  );
}