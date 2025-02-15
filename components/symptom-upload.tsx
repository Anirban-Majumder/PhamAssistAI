 "use client";

import { useState,useContext } from "react";
import { createClient } from "@/lib/supabase/component"; 
import { SessionContext } from "@/lib/supabase/usercontext";

export default function Symptom() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptom, setSymptom] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [input, setInput] = useState<string>("");

  const supabase = createClient();
  const session = useContext(SessionContext);


  // Function to save data to Supabase
  const handleSave = async () => {
    if (input) {
        setSymptom([ ...symptom,input]);
        setInput("");}

    if (!session || !session.user) {
      alert("You must be logged in to save symptoms.");
      return;
    }
    const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("symptoms")
    .eq("user_id", session.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile data:", profileError);
    return;
  }

  const currentsymptoms = profileData?.symptoms || "";
  const newsymptoms = `${symptom}*${currentsymptoms}`
  

  const { data: updateData, error: updateError } = await supabase
    .from("profile")
    .update({ symptoms: newsymptoms })
    .eq("user_id", session.user.id);

    if (updateError) {  
      console.error("Error updating profile data:", updateError);
      return;
    }   
    else{console.log("Symptoms added successfully");}
  };

  return (
    <div>
      {/* Button to Open Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-pink-500 dark:bg-pink-700 text-white px-4 py-2 rounded-full hover:bg-pink-600 dark:hover:bg-cyan-600 transition"
      >+
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-pink-600 dark:text-cyan-400">
              Enter Symptoms
            </h2>

            {/* Symptoms Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter symptom"
                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-2 flex-grow rounded text-gray-800 dark:text-white"
              />
            </div>

            {/* Display Added Symptoms */}
            

            {/* Date Picker */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-2 mt-4 w-full rounded text-gray-800 dark:text-white"
            />

            {/* Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-pink-500 dark:bg-cyan-500 text-white px-4 py-2 rounded hover:bg-pink-600 dark:hover:bg-cyan-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
