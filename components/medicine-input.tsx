"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/component";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Import for delete icon

// Interfaces
interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

export default function MedicineModal() {
  const supabase = createClient();
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", dosage: "", duration: "" }]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false); // State for the warning modal

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
    setShowWarning(false);
    setIsOpen(false); // Close the warning modal before proceeding

    // Your existing save logic
    const response = await fetch("/api/processimg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Image: "IMAGE" }),
    });

    if (response.ok) {
      window.location.reload();
    }
  };

  const handleRemoveSymptom = (index: number): void => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  // New handleSave just triggers the warning modal
  const handleSave = (): void => {
    setShowWarning(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-500 text-white hover:bg-pink-600">
          Add Medicine & Symptoms
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Details</h2>

        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Please confirm your symptoms:</h4>
        <div className="mt-1">
          <Input
            placeholder="Type a symptom and press Enter"
            value={symptomInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSymptomInput(e.target.value)}
            onKeyDown={handleAddSymptom}
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {symptoms.map((symptom, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-cyan-500 text-white rounded-full flex items-center space-x-2"
              >
                <span>{symptom}</span>
                <button onClick={() => handleRemoveSymptom(index)} className="ml-2">
                  <X className="h-4 w-4 text-white hover:text-gray-200" />
                </button>
              </span>
            ))}
          </div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Please confirm your medicine details:</h4>
          {medicines.map((medicine, index) => (
            <div key={index} className="flex flex-wrap gap-2 mb-1">
              <Input
                placeholder="Medicine Name"
                value={medicine.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleMedicineChange(index, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Dosage"
                value={medicine.dosage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleMedicineChange(index, "dosage", e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Duration"
                value={medicine.duration}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleMedicineChange(index, "duration", e.target.value)}
                className="w-24"
              />
            </div>
          ))}

          <Button variant="outline" className="w-full rounded-lg" onClick={handleAddMedicine}>
            + Add Another Medicine
          </Button>
        </div>

        <Button onClick={handleSave} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition">
          Save
        </Button>
      </DialogContent>

      {showWarning && (
        <Dialog open={showWarning} onOpenChange={setShowWarning}>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Are you sure you wish to proceed?</h2>
            <p className="mb-4">
              Please be very sure before you proceed. OCR processing may introduce inaccuracies. Kindly double-check your inputs.
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
  );
}