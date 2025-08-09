"use client";

import Image from "next/image";
import React from "react";

const DataVerificationPanel = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-8 min-h-[70vh] h-full w-full">
      <Image
        src="/assets/no-meter.png"
        alt="No meter selected"
        width={280}
        height={208}
        className="mb-4 h-[120px] w-auto sm:h-[180px] md:h-[208px]"
      />
      <p
        className="text-base sm:text-lg font-medium text-center"
        style={{ fontSize: "clamp(18px, 4vw, 25px)", color: "#7B849A" }}
      >
        No meter is selected !!
      </p>
    </div>
  );
};

export default DataVerificationPanel;
