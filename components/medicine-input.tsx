"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/component";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Import for delete icon

export default function MedicineModal() {
      const supabase = createClient();
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
  };

  const handleAddSymptom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && symptomInput.trim() !== "") {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput(""); // Clear input field
      e.preventDefault();
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // Save medicines to Supabase
      for (const medicine of medicines) {
        await supabase.from("medicine").insert([
          {
            name: medicine.name,
            dosage: medicine.dosage,
            duration: medicine.duration,
          },
        ]);
      }

      // Save symptoms as a *-separated string
      if (symptoms.length > 0) {
        const symptomsString = symptoms.join("*");
        await supabase
          .from("profiles")
          .update({ symptoms: symptomsString })
          .eq("user_id", "user-id-placeholder"); // Replace with actual user ID
      }

      setIsOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-500 text-white hover:bg-pink-600">
          Add Medicine & Symptoms
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Details</h2>

        {medicines.map((medicine, index) => (
          <div key={index} className="mb-4 space-y-2">
            <Input
              placeholder="Medicine Name"
              value={medicine.name}
              onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
            />
            <Input
              placeholder="Dosage"
              value={medicine.dosage}
              onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
            />
            <Input
              placeholder="Duration"
              value={medicine.duration}
              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
            />
          </div>
        ))}

        <Button variant="outline" className="w-full" onClick={handleAddMedicine}>
          + Add Another Medicine
        </Button>

        <div className="mt-4">
          <Input
            placeholder="Type a symptom and press Enter"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyDown={handleAddSymptom}
          />
          <div className="flex flex-wrap gap-2 mt-2">
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
        </div>

        <Button onClick={handleSave} className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white">
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
