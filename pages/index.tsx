import { Layout } from "@/components/layout"
import  Button  from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to MedAid</h1>
        <p className="text-xl text-center mb-8 max-w-2xl">
          MedAid is your trusted companion for all your medical needs. We provide easy access to medical information,
          appointment scheduling, and personalized health tracking.
        </p>
        <Button>
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </Layout>
  )
}