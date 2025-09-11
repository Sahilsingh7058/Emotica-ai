import React from "react";

export const Logo: React.FC<{ className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => {
  return (
    <div className={["flex items-center", className].join(" ")} {...props}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F6633200b88854ecb85d819712761f1b4%2F1902aa38dd9c4046b7ef30aa8bd7896b?format=webp&width=400"
        alt="Emotica logo"
        className="h-12 md:h-14 lg:h-16 w-auto select-none"
        draggable={false}
      />
    </div>
  );
};

export default Logo;
