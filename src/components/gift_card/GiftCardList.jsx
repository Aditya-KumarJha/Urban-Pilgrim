import { useState, useEffect } from "react";
import GiftCardItem from "./GiftCardItem";

export default function GiftCardList() {
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('giftCardScrollPosition');
        if (savedScrollPosition) {
            // Start from top
            window.scrollTo(0, 0);
            
            setTimeout(() => {
                // Smooth scroll to the saved position
                window.scrollTo({
                    top: parseInt(savedScrollPosition),
                    behavior: 'smooth'
                });
                
                // Clean up after restoring
                setTimeout(() => {
                    sessionStorage.removeItem('giftCardScrollPosition');
                    sessionStorage.removeItem('giftCardId');
                    sessionStorage.removeItem('giftCardPosition');
                }, 1000); // Clean up after scroll animation completes
            }, 100);
        }
    }, []);

    useEffect(() => {
        const sampleGiftCards = [
            {
                id: "gift-1",
                title: "Wellness Retreat",
                description: "Perfect for wellness retreats, yoga sessions, and meditation classes. Give the gift of inner peace and transformation.",
                priceOptions: [
                    { value: 1000, originalValue: 1200, discount: 17 },
                    { value: 2000, originalValue: 2400, discount: 17 },
                    { value: 5000, originalValue: 6000, discount: 17 }
                ],
                startingPrice: 1000,
                thumbnail: "/assets/golden-mandala.png",
                gallery: ["/assets/golden-mandala.png", "/assets/meditationimg.jpg", "/assets/yoga.svg"],
                validityMonths: 12,
                features: [
                    "Valid for all wellness retreat programs",
                    "Can be used for yoga and meditation sessions",
                    "Transferable to family and friends",
                    "12 months validity from purchase date"
                ],
                category: "wellness-retreat",
                isPopular: true
            },
            {
                id: "gift-2", 
                title: "Wellness Program",
                description: "Ideal for wellness programs, guided sessions, and personal development experiences. A meaningful gift for holistic growth.",
                priceOptions: [
                    { value: 1000, originalValue: 1200, discount: 17 },
                    { value: 2000, originalValue: 2400, discount: 17 },
                    { value: 5000, originalValue: 6000, discount: 17 }
                ],
                startingPrice: 1000,
                thumbnail: "/assets/meditationimg.jpg",
                gallery: ["/assets/meditationimg.jpg", "/assets/golden-mandala.png", "/assets/yogapeople.png"],
                validityMonths: 18,
                features: [
                    "Valid for all wellness programs",
                    "Includes guided meditation sessions",
                    "Personal development workshops included",
                    "18 months validity from purchase date"
                ],
                category: "wellness-program",
                isPopular: false
            },
            {
                id: "gift-3",
                title: "Pilgrim Guide",
                description: "Comprehensive gift card for pilgrim guide services and spiritual journeys. The ultimate gift for spiritual seekers.",
                priceOptions: [
                    { value: 1000, originalValue: 1200, discount: 17 },
                    { value: 2000, originalValue: 2400, discount: 17 },
                    { value: 5000, originalValue: 6000, discount: 17 }
                ],
                startingPrice: 1000,
                thumbnail: "/assets/yogapeople.png",
                gallery: ["/assets/yogapeople.png", "/assets/golden-mandala.png", "/assets/meditationimg.jpg"],
                validityMonths: 24,
                features: [
                    "Valid for all pilgrim guide services",
                    "Priority booking for spiritual journeys",
                    "Includes personal spiritual consultation",
                    "24 months validity from purchase date"
                ],
                category: "pilgrim-guide",
                isPopular: true
            }
        ];

        // Simulate loading
        setTimeout(() => {
            setGiftCards(sampleGiftCards);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-20 gap-8">
            {giftCards.map((giftCard) => (
                <GiftCardItem key={giftCard.id} giftCard={giftCard} />
            ))}
        </div>
    );
}
