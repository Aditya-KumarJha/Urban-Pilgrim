import Bazar from "../assets/bazar.svg";
import Button from "../components/button.jsx";

function C8ContainerData() {
  return (
    <div className="w-auto h-screen relative">
      <div className="w-full h-full">
        <img src={Bazar} alt="none" className="w-full h-full object-cover" />
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full h-full flex flex-col items-center justify-center gap-7 bg-[rgba(24,76,116,0.3)] rounded-[15px] backdrop-blur-[6.7px] border border-[rgba(255,255,255,0.6)] p-5 text-white md:max-w-[55%] md:max-h-[60%]">
        <div className="flex flex-col items-center justify-between gap-5 text-center">
          <div className="mb-2 text-[26px] md:text-[35px] font-bold font-poppins">
            <strong>Pilgrim Bazaar</strong>
          </div>

          <div className="text-[16px] md:text-[20px] font-medium font-poppins">
            A soulful marketplace for spiritual, wellness, and heritage-inspired products
          </div>

          <div>
            <Button btn_name={"Shop Now"} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default C8ContainerData;
