import RetreatCard from "./RetreatCard";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useDispatch } from "react-redux";
import { setRetreatData } from "../../features/pilgrim_retreat/pilgrimRetreatSlice"


// const retreats = [
//     {
//         title: "Reboot & Rejuvenate in the Himalayas (4 day retreat)",
//         location: "Bhubaneswar, Odisha",
//         price: "74,999.00",
//         image: "https://picsum.photos/200",
//     },
//     {
//         title: "Soul reboot on the Ganges (4 day retreat)",
//         location: "Bhubaneswar, Odisha",
//         price: "74,999.00",
//         image: "https://picsum.photos/200",
//     },
// ];

export default function RetreatList() {

    const [retreats, setRetreats] = useState([]);
    const uid = "user-uid";
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const retreatRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);
                const snapshot = await getDoc(retreatRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    // convert object to array with index
                    const retreatsData = Object.keys(data)
                        .sort((a, b) => Number(a) - Number(b)) 
                        .map((key) => ({
                            id: key,
                            ...data[key],
                        }));

                    setRetreats(retreatsData || []);
                    dispatch(setRetreatData(retreatsData || []));
                } else {
                    console.log("No retreats found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching retreats from Firestore:", error);
            }
        };

        if (uid) fetchData();
    }, [uid, dispatch]);

    return (
        <div className="md:flex md:flex-wrap grid sm:grid-cols-2 gap-8 px-6 py-4 pt-10 md:pt-4 ">
            {retreats.map((retreat) => (
                <RetreatCard key={retreat.id} retreat={retreat} />
            ))}
        </div>
    );

}
