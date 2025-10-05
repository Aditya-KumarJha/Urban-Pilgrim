import { useEffect } from "react";
import { GiftCardList } from "../../components/gift_card";
import SEO from "../../components/SEO.jsx";
import Testimonials from "../../components/Testimonials";

export default function GiftCards() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white lg:mt-[100px] mt-[70px]">
            <SEO
                title="Gift Cards | Urban Pilgrim"
                description="Give the gift of transformation with Urban Pilgrim gift cards. Perfect for yoga, meditation, wellness retreats, and spiritual growth experiences."
                keywords="gift cards, wellness gifts, yoga gift card, meditation gift, spiritual gifts, urban pilgrim gifts"
                canonicalUrl="/gift-cards"
                ogImage="/assets/golden-mandala.png"
            />
            {/* Gift Cards Section */}
            <div className="py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Gift Card</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Select from our range of gift cards designed for different wellness journeys and spiritual experiences.
                        </p>
                    </div>
                    <GiftCardList />
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-16 bg-gradient-to-r from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600">Simple steps to give the perfect gift</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Choose & Purchase</h3>
                            <p className="text-gray-600">Select the perfect gift card amount and complete your purchase securely online.</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Receive & Share</h3>
                            <p className="text-gray-600">Get your digital gift card instantly via email and share it with your loved one.</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Redeem & Enjoy</h3>
                            <p className="text-gray-600">The recipient can use the gift card for any Urban Pilgrim service or experience.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Testimonials />
        </div>
    );
}
