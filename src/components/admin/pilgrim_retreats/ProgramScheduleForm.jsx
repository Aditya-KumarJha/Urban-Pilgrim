import { useState } from "react";

function ProgramScheduleForm() {
  const [programs, setPrograms] = useState([]);

  const handleAddProgram = () => {
    setPrograms((prev) => [...prev, { title: "", description: ""}]);
  };

  const handleTitleChange = (index, value) => {
    const updated = [...programs];
    updated[index].title = value;
    setPrograms(updated);
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...programs];
    updated[index].description = value;
    setPrograms(updated);
  };


  const handleDeleteProgram = (index) => {
    const updated = [...programs];
    updated.splice(index, 1);
    setPrograms(updated);
  };

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Program Schedule<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      {programs.map((program, index) => (
        <div key={index} className="mb-6 pt-4 relative">
          <button
            onClick={() => handleDeleteProgram(index)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Delete
          </button>

          <label className="block font-semibold mb-1">Day {index + 1}</label>
          <input
            type="text"
            value={program.title}
            placeholder="Title"
            onChange={(e) => handleTitleChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />

          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={program.description}
            placeholder="Enter description"
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
            rows={4}
          />
        </div>
      ))}

      <div
        onClick={handleAddProgram}
        className="w-full text-center my-4 bg-[#2F6288] text-white py-2 rounded-md cursor-pointer hover:bg-[#224b66]"
      >
        Add Program
      </div>
    </div>
  );
}

export default ProgramScheduleForm;
