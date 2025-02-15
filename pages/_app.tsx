import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { CopilotKit } from "@copilotkit/react-core";
import { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/component';
import { SessionContext } from '@/lib/supabase/usercontext';

export default function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else if (session) {
          setSession(session);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <SessionContext.Provider value={session}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem>
      <CopilotKit runtimeUrl="/api/copilotkit">
        <Component {...pageProps} />
      </CopilotKit>
    </ThemeProvider>
    </SessionContext.Provider>
  )
}