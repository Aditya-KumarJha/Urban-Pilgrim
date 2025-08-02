function Location() {

  return (
    <div className="p-8 mx-auto">
        <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
            Location <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
        </h2>
        <input
            type="text"
            value={location}
            placeholder="Enter description"
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
            rows={4}
        />
    </div>
  )
}

export default Location