import { useEffect, useState } from "react";
import { FaSnowflake } from "react-icons/fa";
import ClothingSuggestions from "./ClothingSuggestions";

const WeatherSection = ({ location }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_KEY = "96826912447f9989aa65788f173dc644";
    
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
                );
                const data = await res.json();
                setWeather(data);
            } catch (err) {
                console.error("Weather fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (location) fetchWeather();
    }, [location]);

    if (loading) return <p>Loading weather...</p>;

    return (
        <div className="flex md:flex-row flex-col w-full mx-auto bg-white rounded-2xl shadow-md overflow-hidden mt-[100px]">
            {/* Left: Weather Info */}
            <div className="bg-[#396E94] text-white p-6 max-w-7xl w-full mx-auto flex flex-col justify-center md:rounded-l-2xl rounded-t-2xl md:rounded-tr-none">
                <FaSnowflake className="md:text-7xl text-4xl mb-4" />
                <h3 className="text-xl font-semibold">
                    {location} Weather Forecast
                </h3>
                <p className="mt-2 text-sm">
                    {weather?.weather?.[0]?.description || "Not available"} | Temp:{" "}
                    {weather?.main?.temp}°C | Humidity: {weather?.main?.humidity}%
                </p>
            </div>

            {/* Right: Clothing List (Gemini) */}
            <ClothingSuggestions weather={weather} />
        </div>
    );
};

export default WeatherSection;
