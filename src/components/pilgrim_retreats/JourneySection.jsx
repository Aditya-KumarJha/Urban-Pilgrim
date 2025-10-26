export default function JourneySection({
  journey,
  retreatDescription,
  location,
}) {
  return (
    <div className="max-w-7xl mx-auto md:px-6 pt-0 pb-8 space-y-10 text-[#111]">
      {/* Section 1: Introduction */}
      <section className="space-y-4">
        <h2 className="md:text-2xl text-xl font-bold">
          {journey?.title || "The Journey Inward Begins"}
        </h2>
        <div
          className="text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: journey?.description1 || "" }}
        />
        <div
          className="text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: journey?.description2 || "" }}
        />
      </section>

      {/* Section 2: Location */}
      <section className="space-y-4">
        <h3 className="text-md font-semibold">Location map</h3>
        <div
          className="text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: journey?.description3 || "" }}
        />

        {/* map */}
        {location ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title={`Open ${location} in Google Maps`}
          >
            <div className="rounded-xl shadow-lg overflow-hidden w-full">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
                title={`Map of ${location}`}
                className="w-full h-64 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </a>
        ) : (
          <img
            src="/assets/location.svg"
            alt="Location map"
            className="rounded-xl shadow-lg w-full h-auto min-h-40 object-cover"
          />
        )}
      </section>

      {/* Section 3: Instructions */}
      <section className="space-y-4">
        {retreatDescription &&
          retreatDescription.map((desc, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-md font-semibold mb-2">{desc.title}</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                {desc?.subpoints.map((item, idx) => (
                  <li
                    key={idx}
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>
            </div>
          ))}
      </section>
    </div>
  );
}
