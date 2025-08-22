import { useSelector } from "react-redux";
import GuideCard from "./GuideCard";
import { useEffect } from "react";

export default function GuidesDemo() {

    const Data = useSelector(
        (state) => state?.pilgrimGuides?.guides
    );

    console.log("Data: ", Data);
    const sessions = Data?.map((program) => ({
        image: program?.guideCard?.thumbnail,
        category: program?.guideCard?.category,
        title: program?.guideCard?.title,
        price: program?.guideCard?.price,
    }));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className="px-6 py-12 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                        <GuideCard key={index} {...session} />
                    ))}
                </div>
            </div>
        </section>
    );
}
