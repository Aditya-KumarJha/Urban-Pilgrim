const PilgrimGuide = ({ guides }) => {
    return (
        <section className="bg-[#1F4B6E] text-white px-6 py-12 w-screen">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:items-start items-center">
                <img
                    src={guides?.image}
                    alt="Pilgrim Guide"
                    className="w-full aspect-[3/4] md:w-2/7 md:h-full md:max-h-none max-h-90 rounded-lg shadow-lg object-cover"
                />

                <div className="text-sm leading-relaxed">
                    <h2 className="text-white text-xl font-semibold mb-4">{guides?.title}</h2>

                    <p className="mb-2">
                        {guides?.description
                            ?.split(/(?<=[.:])/g) // split at . or : but keep them
                            .filter(sentence => sentence.trim().length > 0) // remove empties
                            .map((sentence, index) => {
                                const trimmed = sentence.trim();
                                return (
                                    <p key={index} className="mb-4">
                                        {trimmed}
                                        {trimmed.endsWith(":") && <br />} {/* line break after ":" */}
                                    </p>
                                );
                            })}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PilgrimGuide;
