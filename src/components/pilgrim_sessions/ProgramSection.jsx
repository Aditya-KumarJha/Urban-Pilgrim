export default function ProgramSection({ program, journey }) {
  return (
    <div className="max-w-7xl pt-5 space-y-10 text-[#111]">
      {/* About the Program */}
      <section className="space-y-4">
        <h2 className="md:text-2xl text-xl font-bold">{program?.title}</h2>
        <div
          className="text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: program?.shortDescription || "",
          }}
        />
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
          {program?.points[0] &&
            program?.points?.map((item, index) => (
              <li
                key={index}
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: item || "" }}
              />
            ))}
        </ul>
      </section>

      {/* Journey Section */}
      {journey?.title !== "" && journey?.points?.length > 0 && (
        <section className="space-y-4 ">
          <h2 className="md:text-2xl text-xl font-bold">{journey?.title}</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
            {journey?.points?.map((item, index) => (
              <li
                key={index}
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: item || "" }}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
