import { FloatingDock } from "@/components/ui/floating-dock";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconHome,
  IconPill,
  IconLogin,
  IconUser,
  IconLogout,
  IconMicroscope,
  IconStethoscope
} from "@tabler/icons-react";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import "@copilotkit/react-ui/styles.css";
import { CopilotPopup } from "@copilotkit/react-ui";
import { SessionContext } from '@/lib/supabase/usercontext';
import { title } from "process";
import { Icon } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const session = useContext(SessionContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!session);
  }, [session]);

  const dockItems = [
    {
      title: "Dashboard",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Dashboard",
    },
    {
      title: "Medicine",
      icon: (
        <IconPill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Medicine",
    },
    {
      title:"Lab Tests",
      icon: (
        <IconMicroscope className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Labs",
    },
    (!isLoggedIn?{
      title: "Sign In",
      icon: (
        <IconLogin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/SignIn"
    }:{
      title: "Sign Out",
      icon: (
        <IconLogout className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/SignOut"
    }),
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Profile",
    }
  ];

  return (
    <div className="w-screen h-screen bg-white dark:bg-black text-black dark:text-neutral-300 overflow-hidden relative">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 h-full overflow-hidden">
      <CopilotPopup
                instructions={"You are an AI assistant for a  PharmAssistAI that scans prescriptions and provides medication info. Interpret prescriptions, offer detailed med info including dosages and precautions, and answer user queries in concise about their prescriptions and medications clearly and safely."}
                labels={{
                  title: "ChatBot",
                  initial: "Hello there, How can I help You today?",
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