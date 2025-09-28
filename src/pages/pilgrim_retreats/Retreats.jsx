import FilterBar from "../../components/pilgrim_retreats/FilterBar";
import CategorySelector from "../../components/pilgrim_retreats/CategorySelector";
import RetreatList from "../../components/pilgrim_retreats/RetreatList";
import { MdKeyboardArrowDown } from "react-icons/md";
import Testimonials from "../../components/Testimonials";
import SEO from "../../components/SEO.jsx";
import { useEffect, useState } from "react";

export default function Retreats() {
    const [filters, setFilters] = useState({});
    const [bestSellingActive, setBestSellingActive] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFiltersChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleCategoryChange = (category) => {
        setFilters(prev => ({ ...prev, category }));
    };

    const toggleBestSelling = () => {
        setBestSellingActive(!bestSellingActive);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
            <SEO
                title="Pilgrim Retreats | Urban Pilgrim"
                description="Immerse yourself in authentic retreat experiences with Urban Pilgrim. Find yoga, meditation, and wellness retreats across India."
                keywords="wellness retreats, yoga retreat, meditation retreat, urban pilgrim retreats, holistic wellness getaways"
                canonicalUrl="/pilgrim_retreats"
                ogImage="/retreats.svg"
            />
            <div className="relative w-full mb-10">
                <img
                    src="/retreats.svg"
                    alt="Retreat Header"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 px-6 py-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Pilgrim Retreats</h1>
                    <div className="flex justify-between items-center flex-wrap gap-4 my-8">
                        <FilterBar onFiltersChange={handleFiltersChange} />
                        
                    </div>
                </div>
                <div className="absolute w-full -translate-y-1/3 px-4">
                    <CategorySelector 
                        onCategoryChange={handleCategoryChange} 
                    />
                </div>
            </div>

            <RetreatList filters={filters} bestSellingActive={bestSellingActive} />
            <Testimonials />
        </div>
    );
}
