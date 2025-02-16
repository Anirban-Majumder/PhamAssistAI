"use client";

import { useState, useEffect, KeyboardEvent, ChangeEvent, useContext } from "react";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Import for delete icon

// Interfaces
interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  id?: number;
}

interface OCRItem {
  symptom: string; // Comma separated symptoms
  meds: Medicine[]; // Array of medicine objects
}

interface MedicineModalProps {
  imgUrl?: string;
}

export default function OCRModal({ imgUrl }: MedicineModalProps) {
  const supabase = createClient();
  const session = useContext(SessionContext);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [symptomInput, setSymptomInput] = useState<string>("");
  // If an image URL is provided, open the modal automatically.
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  // New state for saving loader
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // When an image URL is provided, process it with the OCR endpoint
  useEffect(() => {
    async function fetchOCR() {
      try {
        const response = await fetch("/api/doOCR", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imgUrl }),
        });
        if (response.ok) {
          const data = await response.json();
          // Assuming "ocr" is a JSON-string representing a valid JSON array
          const parsed: OCRItem[] = JSON.parse(data.ocr);
          const medicinesList: Medicine[] = [];
          const symptomsSet = new Set<string>();
          parsed.forEach((item) => {
            if (item.symptom) {
              item.symptom.split(",").forEach((s) => {
                const trimmed = s.trim();
                if (trimmed) symptomsSet.add(trimmed);
              });
            }
            if (Array.isArray(item.meds)) {
              item.meds.forEach((med) => {
                medicinesList.push({
                  name: med.name || "",
                  dosage: med.dosage || "",
                  duration: med.duration || "",
                });
              });
            }
          });
          setSymptoms(Array.from(symptomsSet));
          setMedicines(medicinesList);
          setLoading(false);
          setIsOpen(true);
        } else {
          console.error("OCR endpoint returned an error.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching OCR:", error);
        setLoading(false);
      }
    }
    if (imgUrl) {
      fetchOCR();
    }
  }, [imgUrl]);

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
  };

  const handleAddSymptom = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && symptomInput.trim() !== "") {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput(""); // Clear input field
      e.preventDefault();
    }
  };

  const handleFinalSave = async (): Promise<void> => {
    if (!session || !session.user) {
      alert("You must be logged in to save symptoms.");
      return;
    }

    // Show saving loader
    setIsSaving(true);

    // Update profile symptoms.
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("symptoms")
      .eq("user_id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      setIsSaving(false);
      return;
    }

    const newSymptoms = symptoms.join("*") + "*" + (profileData?.symptoms || "");

    const { error: updateProfileError } = await supabase
      .from("profile")
      .update({ symptoms: newSymptoms })
      .eq("user_id", session.user.id);

    if (updateProfileError) {
      console.error("Error updating profile data:", updateProfileError);
      setIsSaving(false);
      return;
    } else {
      console.log("Symptoms added successfully");
    }

    // Insert each medicine record into the 'medicine' table.
    for (const med of medicines) {
      const { error } = await supabase.from("medicine").insert({
        user_id: session.user.id,
        name: med.name,
        duration: med.duration,
        dosage: med.dosage,
      });
      if (error) {
        console.error("Error inserting medicine:", error);
        setIsSaving(false);
        return;
      } else {
        console.log("Medicine inserted:", med);
      }
    }

    setShowWarning(false);
    setIsOpen(false); // Close the modal before proceeding
    setIsSaving(false);
    window.location.reload();
  };

  const handleRemoveSymptom = (index: number): void => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  // This save now triggers a warning/confirmation modal.
  const handleSave = (): void => {
    setShowWarning(true);
  };

  return (
    <>
      {/* OCR and Form Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Edit Details
          </h2>

          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Confirm your symptoms:
          </h4>
          <div className="mt-2">
            <Input
              placeholder="Type a symptom and press Enter"
              value={symptomInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSymptomInput(e.target.value)}
              onKeyDown={handleAddSymptom}
            />
            <div className="flex flex-wrap gap-1">
              {symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="-mt-12 px-2 py-1 bg-cyan-500 text-white rounded-full flex items-center space-x-2"
                >
                  <span>{symptom}</span>
                  <button onClick={() => handleRemoveSymptom(index)} className="ml-2">
                    <X className="h-4 w-4 text-white hover:text-gray-200" />
                  </button>
                </span>
              ))}
            </div>

            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirm your medicine details:
            </h4>
            {medicines.map((medicine, index) => (
              <div key={index} className="flex flex-wrap gap-2 mb-1">
                <Input
                  placeholder="Medicine Name"
                  value={medicine.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMedicineChange(index, "name", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMedicineChange(index, "dosage", e.target.value)
                  }
                  className="w-24"
                />
                <Input
                  placeholder="Duration"
                  value={medicine.duration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMedicineChange(index, "duration", e.target.value)
                  }
                  className="w-24"
                />
              </div>
            ))}

            <Button variant="outline" className="w-full rounded-lg" onClick={handleAddMedicine}>
              + Add Another Medicine
            </Button>
          </div>

          <Button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Save
          </Button>
        </DialogContent>

        {showWarning && (
          <Dialog open={showWarning} onOpenChange={setShowWarning}>
            <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Are you sure you wish to proceed?
              </h2>
              <p className="mb-4">
                Please be very sure before you proceed. OCR processing may introduce inaccuracies.
                Kindly double-check your inputs.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowWarning(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFinalSave}>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Dialog>

      {/* Loading Popup Modal */}
      {loading && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-10 w-10 text-gray-900 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              <span className="mt-4 text-gray-900 dark:text-white">Loading...</span>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Saving Popup Modal */}
      {isSaving && (
        <Dialog open={isSaving} onOpenChange={() => {}}>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-gray-900 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span className="mt-4 text-gray-900 dark:text-white">Saving...</span>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}