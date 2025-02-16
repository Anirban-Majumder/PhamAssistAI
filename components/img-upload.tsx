"use client";

import { useState, useRef, useContext, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import { Input } from "@/components/ui/input";
import OCRModal from "./medicine-input";

export default function ImageUpload() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrImgUrl, setOcrImgUrl] = useState<string | null>(null); // New state for OCR modal URL
  const [medicineName, setMedicineName] = useState("");
  const [duration, setDuration] = useState("");
  const [time, setTime] = useState("");
  const [idmed, setIdmed] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const skipFetchSuggestions = useRef(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file); // Save file to state; do not upload yet.
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function uploadToPrescriptionBucket(file: File): Promise<string | undefined> {
    if (!session?.user?.id) {
      console.error("User session not found.");
      return;
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("prescription")
      .upload(`${session.user.id}/${file.name}`, file);

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return;
    }
    const fullUrl = `https://xckjeaabdidbmwnzqukp.supabase.co/storage/v1/object/public/${uploadData?.fullPath}`;

    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("prescriptions")
      .eq("user_id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return;
    }

    const currentPrescriptions = profileData?.prescriptions || "";
    const newPrescriptions = currentPrescriptions
      ? `${fullUrl}*${currentPrescriptions}`
      : fullUrl;

    const { data: updateData, error: updateError } = await supabase
      .from("profile")
      .update({ prescriptions: newPrescriptions })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating profile with new prescription:", updateError);
    } else {
      console.log("File uploaded and profile updated successfully:", updateData);
      // Clear preview states
      setImage(null);
      setSelectedFile(null);
      setIsOpen(false);
      setIsManualOpen(false);
      // Return the URL for OCR processing.
      return fullUrl;
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);

      const capturedImage = canvas.toDataURL("image/jpeg");
      setImage(capturedImage);
      const blob = await fetch(capturedImage).then((res) => res.blob());
      setSelectedFile(new File([blob], "captured-image.jpg", { type: "image/jpeg" }));

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const fetchSuggestions = useCallback(async (search: string) => {
    if (!search) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/getMedinfo?name=${encodeURIComponent(search)}`);
      const data = await response.json();
      setSuggestions(data.hits);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipFetchSuggestions.current) {
      skipFetchSuggestions.current = false;
      return;
    }
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(medicineName);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineName, fetchSuggestions]);

  const handleDataSave = async () => {
    if (!medicineName || !duration || !time) return;
    if (!session?.user?.id) {
      console.error("User session not found.");
      return;
    }
    const { data: updateData, error: updateError } = await supabase
      .from("medicine")
      .insert({
        user_id: session.user.id,
        name: medicineName,
        duration: duration,
        dosage: time,
        idmed: idmed,
      })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating meds:", updateError);
    } else {
      console.log("Updated meds successfully:", updateData);
    }
    setIsManualOpen(false);
    setIsOpen(false);
    // You can optionally trigger a refresh or set state here.
    // window.location.reload();
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    const uploadedUrl = await uploadToPrescriptionBucket(selectedFile);
    if (uploadedUrl) {
      // Instead of reloading, show the OCR modal with the uploaded image URL.
      setOcrImgUrl(uploadedUrl);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#db2777] text-primary-foreground hover:bg-[#db2777]/90 rounded-full p-3 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      >
        <Icon icon="mdi:plus" className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setImage(null);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>

            {!image ? (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleCameraCapture}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <Icon icon="mdi:camera" className="w-5 h-5" />
                  <span>Open Camera</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <Icon icon="mdi:file-upload" className="w-5 h-5" />
                  <span>Upload Image</span>
                </button>

                <button
                  onClick={() => setIsManualOpen(true)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <Icon icon="mdi:pencil" className="w-5 h-5" />
                  <span>Enter Manually</span>
                </button>

                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg mb-4">
                  <Image src={image || "/placeholder.svg"} alt="Uploaded" layout="fill" objectFit="cover" />
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleSave}
                    className="bg-success text-success-foreground hover:bg-success/90 rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-success focus:ring-opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setImage(null);
                      setSelectedFile(null);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualOpen && (
        <div className="fixed inset-0 text-base bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Enter Medicine Details</h2>
              <button
                onClick={() => setIsManualOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="relative flex-1" ref={searchRef}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Medicine Name"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                    <div className="p-1">
                      {suggestions.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          No results found
                        </div>
                      ) : (
                        suggestions.map((suggestion) => (
                          <div
                            key={suggestion.name}
                            className="px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer"
                            onClick={() => {
                              skipFetchSuggestions.current = true;
                              setMedicineName(suggestion.name);
                              setShowSuggestions(false);
                              setIdmed(suggestion.id);
                            }}
                          >
                            <div className="text-sm font-medium">{suggestion.name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Input
                type="text"
                placeholder="Duration (e.g., 7 days)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />

              <Input
                type="text"
                placeholder="Time (e.g., Morning, Night)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />

              <button
                onClick={handleDataSave}
                className="bg-pink-600 text-white hover:bg-pink-800 rounded-lg px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render the OCRModal after a successful upload */}
      {ocrImgUrl && <OCRModal imgUrl={ocrImgUrl} />}
    </>
  );
}