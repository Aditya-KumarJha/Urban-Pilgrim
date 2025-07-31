import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ViewAll({ link }) {
  const navigate = useNavigate();
    const handleClick = () => {
        navigate(link);
    };
  return (
    <div className="flex w-full justify-end">
        <motion.button 
            onClick={()=>{handleClick()}}
            initial={{ opacity: 0, x: 50, y: 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
            className="z-[10] text-xs md:text-sm 
            bg-gradient-to-b from-[#C5703F] to-[#C16A00] 
            bg-clip-text text-transparent 
            border-2 border-[#C5703F] rounded-full 
            py-1 md:py-2 px-4 md:px-8 cursor-pointer 
            transition-all duration-300
            hover:text-white hover:bg-gradient-to-b hover:from-[#C5703F] hover:to-[#C16A00] hover:bg-clip-border hover:border-white"
        >
            View All
        </motion.button>

    </div>
  )
}

export default ViewAll