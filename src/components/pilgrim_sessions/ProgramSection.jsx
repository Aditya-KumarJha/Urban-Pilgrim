export default function ProgramSection( { program, journey } ) {
  return (
    <div className="max-w-7xl md:px-6 pt-0 pb-8 space-y-10 text-[#111]">
      {/* About the Program */}
      <section className="space-y-4">
        <h2 className="md:text-2xl text-xl font-bold">{program?.title}</h2>
        <p className="text-sm">
          {program?.shortDescription}
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
            {program?.points[0] && program?.points?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
        </ul>
      </section>

      {/* Journey Section */}
      <section className="space-y-4">
        <h2 className="md:text-2xl text-xl font-bold">
          {journey?.title}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
          {journey?.points?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
