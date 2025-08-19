import { motion } from "framer-motion";
import './About.css';
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function About() {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [rightTitle, setRightTitle] = useState("");
    const [rightDescription, setRightDescription] = useState("");

    const uid = "your-unique-id";

    useEffect(() => {

        const fetchLeftData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionOne`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setImage(data.sectionOne.image);
                    setTitle(data.sectionOne.title);
                    setDescription(data.sectionOne.description);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        const fetchRightData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionTwo`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setRightTitle(data.sectionTwo.title);
                    setRightDescription(data.sectionTwo.description);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchLeftData();
        fetchRightData();
    }, []);

    return (
        <motion.div className="content1">

            {/* Left part */}
            <div className="overlap-container ">
                <motion.div
                    className="textbox1"
                    initial={{ x: -200, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: true }} // remove if you want it every time on scroll
                >
                    <span>{title}</span>
                </motion.div>

                <motion.img
                    src={image}
                    alt="overlay image"
                    initial={{ y: 200, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: true }} // remove if you want it every time on scroll
                />

                <motion.p
                    className="overlaypara"
                    animate={{
                        y: [200, 0],
                        transition: { duration: 0.5 },
                    }}
                >
                    <span>{description}</span>
                </motion.p>
            </div>

            {/* Right part */}
            <div className="rightbox">
                <motion.div
                    className="flow"
                    initial={{ x: 700, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <motion.div
                        className="divheading"
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    >
                        Explore, Heal, Transform Explore, Heal, Transform
                    </motion.div>

                    <div className="about-container">
                        <div className="about-heading">
                            {(() => {
                                const parts = rightTitle.split(":");
                                if (parts.length > 1) {
                                    return (
                                        <>
                                            {parts.slice(0, -1).join(":")}{" "}
                                            <strong>{parts[parts.length - 1]}</strong>
                                        </>
                                    );
                                }
                                return <>{rightTitle}</>;
                            })()}
                        </div>

                        <div className="aboutme-text">
                            {(() => {
                                const words = rightDescription.split(" ");
                                if (words.length >= 5) {
                                    return (
                                        <>
                                            <strong>{words.slice(0, 2).join(" ")}</strong>{" "}
                                            {words.slice(2, -3).join(" ")}{" "}
                                            <strong>{words.slice(-3).join(" ")}</strong>
                                        </>
                                    );
                                }
                                return <>{rightDescription}</>;
                            })()}
                        </div>
                    </div>

                </motion.div>
            </div>
        </motion.div>

    );
}     