"use client"

import { useState, useRef } from "react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ImageUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream
      await video.play()

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext("2d")?.drawImage(video, 0, 0)

      const capturedImage = canvas.toDataURL("image/jpeg")
      setImage(capturedImage)

      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const handleSave = async () => {
    if (!image) return
    const response = await fetch("/api/processimg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    })
    if (response.ok) {
      router.push("/Medicine")
    }
  }

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Image</h2>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setImage(null)
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
                    onClick={() => setImage(null)}
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
    </>
  )
}