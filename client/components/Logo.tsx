import React from "react";
import Logo2 from "./img/Logo2.png"; 
import Name from "./img/name logo.png"; 

export const Logo: React.FC<{ className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => {
  return (
    <div className={["flex items-center", className].join(" ")} {...props}>
      <img
        src={Logo2}
        alt="Emotica font-bold"
        className="h-12 md:h-14 lg:h-[70px] w-auto select-none"
        draggable={false}
      />
      <img src={Name} alt="" className="w-[120px] ml-2" />
    </div>
  );
};

export default Logo;
