import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { CopilotKit } from "@copilotkit/react-core";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem>
      <CopilotKit runtimeUrl="/api/copilotkit">
        <Component {...pageProps} />
      </CopilotKit>
    </ThemeProvider>
  )
}