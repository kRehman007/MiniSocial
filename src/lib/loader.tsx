import { Loader } from "lucide-react";

const CustomLoader = ({ size = 24, className = "" }) => {
  return <Loader className={`animate-spin ${className}`} size={size} />;
};

export default CustomLoader;

export const CustomPageLoader = ({ size = 32, className = "", text = "Loading..." }) => {
  return (
    <div className="flex w-full flex-col h-[calc(100vh-90px)] justify-center items-center">
      <Loader className={`animate-spin ${className}`} size={size} />
      <p className="text-custom-grey text-center">{text}</p>
    </div>
  );
};