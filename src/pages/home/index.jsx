import { useRef, useState, useEffect } from "react";
import "./Home.css";

import { useInView } from "react-intersection-observer";
import Footer from "../../components/footer/index.jsx";
import C3_container_data from "../../components/c3_container_data.jsx";
import SEO from "../../components/SEO.jsx";
import Program_Explorer from "../../components/ProgramExplorer.jsx";
import PersondetailsCard from "../../components/persondetails_card.jsx";
import C8_container_data from "../../components/c8_container_data.jsx";
import { motion, useAnimation } from "framer-motion";
import StepWizard from "../../components/StepWizard.jsx";
import Highlights from "../../components/Highlights.jsx";
import HeroCarousel from "../../components/HeroCarousel.jsx";
import About from "../../components/about/About.jsx";
import UpComing from "../../components/upcoming_events/UpComing.jsx";
import ViewAll from "../../components/ui/button/ViewAll.jsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";

function Home() {
    // const wrapperRef = useRef(null);
    // const [lineHeight, setLineHeight] = useState(0);
    const [contentFeatures, setContentFeatures] = useState(null);
    const [contentImage, setContentImage] = useState(null);
    const [Experience, setExperience] = useState(null);
    const [sessions, setSessions] = useState(null);
    const [guides, setGuides] = useState(null);

    const cardContainerRef = useRef(null);
    const [progress, setProgress] = useState(0);
    // const controls = useAnimation();
    // const scrollAmount = 300;

    const uid = "your-unique-id";

    // content image
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionFour`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setContentFeatures(data?.sectionFour?.features || []);
                    setContentImage(data?.sectionFour?.image || null);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    // experiences/retreat
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionFive`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setExperience(data?.sectionFive || {});
                } else {
                    console.log("No experiences found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching experiences from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const [experienceData, setExperienceData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `pilgrim_retreat/user-uid/retreats/data`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    const retreatsData = Object.keys(data)
                        .map((key) => ({
                            id: key,
                            ...data[key],
                        }));

                    setExperienceData(retreatsData || null);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    // sessions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionSix`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setSessions(data?.sectionSix || {});
                } else {
                    console.log("No sessions found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching sessions from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const [sessionData, setSessionData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `pilgrim_sessions/pilgrim_sessions/sessions/liveSession`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setSessionData(data?.slides || []);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    // guides
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionSeven`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setGuides(data?.sectionSeven || {});
                } else {
                    console.log("No guides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching guides from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const [guideData, setGuideData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `pilgrim_guides/pilgrim_guides/guides/data`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setGuideData(data?.slides || []);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchData();
    }, []);



    // const handleCardScroll = (dir) => {
    //     if (cardContainerRef.current) {
    //         const container = cardContainerRef.current;
    //         const newScroll =
    //             dir === "left"
    //                 ? container.scrollLeft - scrollAmount
    //                 : container.scrollLeft + scrollAmount;
    //         container.scrollTo({ left: newScroll, behavior: "smooth" });

    //         const maxScroll = container.scrollWidth - container.clientWidth;
    //         const newProgress = (newScroll / maxScroll) * 100;
    //         setProgress(newProgress);
    //     }
    // };

    useEffect(() => {
        const container = cardContainerRef.current;
        if (!container) return;

        const updateProgress = () => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const newProgress = (container.scrollLeft / maxScroll) * 100;
            setProgress(newProgress);
        };

        container.addEventListener("scroll", updateProgress);
        return () => container.removeEventListener("scroll", updateProgress);
    }, []);

    // const handleScroll = () => {
    //     const el = wrapperRef.current;
    //     const scrollRatio = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    //     setLineHeight(scrollRatio * 300);
    // };

    const Controls = useAnimation();
    const [Ref, InView] = useInView({
        threshold: 0.3,
        triggerOnce: true,
    });

    useEffect(() => {
        if (InView) {
            Controls.start("visible");
        }
    }, [InView, Controls]);

    return (
        <div className="hero-section no-scrollbar">
            <SEO
                title="Urban Pilgrim | Wellness Events, Retreats & Sessions"
                description="Discover authentic wellness experiences with Urban Pilgrim. Book yoga, meditation, and holistic wellness sessions with trusted guides."
                keywords="urban pilgrim, wellness, yoga, meditation, retreats, sessions, holistic wellness, Indian wisdom"
                canonicalUrl="/"
                ogImage="/public/assets/home_page_img.png"
            />
            <HeroCarousel />
            <About />
            <UpComing />

            {/* Explore our program */}
            <div className="content2">
                <div className="div">
                    <Program_Explorer />
                </div>
            </div>

            {/* content */}
            <div className="content3">
                <div className="c3container">
                    <motion.div className="c3img" initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true }}>
                        <img src={contentImage} alt="iamge" />
                    </motion.div>
                    <motion.div className="c3text_container" initial={{ x: 100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true }}>
                        <motion.div className="datacontainer">
                            { contentFeatures &&
                                contentFeatures.map((feature, index) => (
                                    <C3_container_data key={index} imageCss="lg:max-h-[40px] lg:max-w-[30px] sm:max-h-[40px] sm:max-w-[30px] sm:mt-0 mt-1 max-h-[30px] max-w-[25px]" img={feature?.image} heading={feature?.title} content={feature?.shorttitle} />
                                ))
                            }
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Book your Pilgrim Experience/Retreat */}
            <div className="content5">
                <div className="c5container">
                    {/* Heading */}
                    <motion.div className="c5top" initial={{ x: -200, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.1 }}>
                        <div className="text-2xl md:text-3xl font-bold text-left text-black"><strong>{Experience?.title}</strong></div>
                        <div className="c5description">
                            {Experience?.description
                                ?.split(" ")
                                .slice(0, 10)
                                .join(" ")}...
                        </div>
                    </motion.div>

                    <ViewAll link="/pilgrim_retreats" />

                    {/* Card */}
                    <motion.div className="c5bottom lg:!overflow-visible" initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.1 }}>
                        {experienceData &&
                            experienceData.map((experience, index) => (
                                <PersondetailsCard type="retreat" key={index} image={experience?.pilgrimRetreatCard?.image} title={experience?.pilgrimRetreatCard?.title} price={experience?.pilgrimRetreatCard?.price} />
                            ))
                        }
                    </motion.div>
                </div>
            </div>

            {/* Find your Pilgrim Session */}
            <div className="content5 ">
                <div className="c5container">
                    {/* Heading */}
                    <motion.div className="c5top" initial={{ x: -200, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.1 }}>
                        <div className="text-2xl md:text-3xl font-bold text-left text-black"><strong>{sessions?.title}</strong></div>
                        <div className="c5description">
                            {sessions?.description
                                ?.split(" ")
                                .slice(0, 10)
                                .join(" ")}...
                        </div>
                    </motion.div>

                    {/* Card */}
                    <ViewAll link="/pilgrim_sessions" />
                    <motion.div className="c5bottom lg:!overflow-visible" initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.1 }}>
                        {
                            sessionData &&
                            sessionData.map((session, index) => (
                                <PersondetailsCard type="live-session" key={index} image={session?.liveSessionCard?.thumbnail} title={session?.liveSessionCard?.title} price={session?.liveSessionCard?.price} />
                            ))
                        }
                    </motion.div>
                </div>
            </div>

            {/* Find your Guides */}
            <div className="content6">
                <div className="meditateimg ">
                    <img src="/assets/meditationimg.png" alt="error" />
                </div>
                
                <div className="c6container">
                    <div className="imgover-content">
                        {/* Heading */}
                        <motion.div className="c6top" initial={{ x: -200, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.05 }}>
                            <div className="text-2xl md:text-3xl font-bold text-left text-black"><strong>{guides?.title}</strong></div>
                            <div className="c6description" style={{ color: "#4F4F4F" }}>
                                {guides?.description
                                    ?.split(" ")
                                    .slice(0, 10)
                                    .join(" ")}...
                            
                            </div>
                        </motion.div>

                        {/* Card */}
                        <ViewAll link="/pilgrim_guides" />
                        <div className="c6bottom lg:!gap-10 lg:!overflow-visible overflow-hidden">
                            {
                                guideData &&
                                guideData.map((guide, index) => (
                                    <motion.div key={index} initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true, amount: 0.1 }}>
                                        <PersondetailsCard type="guide" image={guide?.guideCard?.thumbnail} title={guide?.guideCard?.title} price={guide?.guideCard?.price} />
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Yoga */}
            <Highlights />

            <div className="content8">
                <C8_container_data />
            </div>
        </div>
    );
}

export default Home;
