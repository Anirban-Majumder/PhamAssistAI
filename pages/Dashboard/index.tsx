import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { SessionContext } from "@/lib/supabase/usercontext";
import Button from "@/components/ui/button";

export default function Dashboard() {
  const session = useContext(SessionContext);
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setShowOverlay(true);
    }
  };

  const handleSaveImage = async () => {
    if (!image) return;
    const response = await fetch("/api/processimg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    if (response.ok) {
      alert("Image uploaded successfully!");
    } else {
      alert("Failed to upload image.");
    }
    setShowOverlay(false);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Dashboard, {session?.user?.email || "user"}!
        </h1>
        <div className="flex gap-4">
          <Button onClick={() => fileInputRef.current?.click()}>Upload / Take Picture</Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {showOverlay && image && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <img src={image} alt="Uploaded" className="w-64 h-64 object-contain mb-4" />
            <div className="flex justify-between">
              <Button onClick={() => setShowOverlay(false)}>Cancel</Button>
              <Button onClick={handleSaveImage}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}