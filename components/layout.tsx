import { FloatingDock } from "@/components/ui/floating-dock";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconHome,
  IconPill,
  IconDashboard,
  IconLogin,
  IconSettings,
} from "@tabler/icons-react";
import type React from "react";
import "@copilotkit/react-ui/styles.css";
import { CopilotPopup } from "@copilotkit/react-ui";


export function Layout({ children }: { children: React.ReactNode }) {
  const dockItems = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Medicine",
      icon: (
        <IconPill className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/medicine",
    },
    {
      title: "Dashboard",
      icon: (
        <IconDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Dashboard",
    },
    {
      title: "Sign In",
      icon: (
        <IconLogin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/signin",
    },
    {
      title: "Settings",
      icon: (
        <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/Settings",
    },
  ];

  return (
    <div className="w-screen h-screen bg-white dark:bg-black text-black dark:text-neutral-300 overflow-hidden relative">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 h-full overflow-hidden">
      <CopilotPopup
                instructions={"You are an AI assistant for a Med-Aid app that scans prescriptions and provides medication info. Interpret prescriptions, offer detailed med info including dosages and precautions, and answer user queries in concise about their prescriptions and medications clearly and safely."}
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