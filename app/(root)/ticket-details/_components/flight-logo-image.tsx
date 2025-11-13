import Image from "next/image";
import React from "react";

type Segment = {
  carrierCode: string;
  airlineName?: string;
};

interface FlightLogoImageProps {
  segment: Segment;
  width?: number;
  height?: number;
  cssClass?: string;
}

const FlightLogoImage: React.FC<FlightLogoImageProps> = ({
  segment,
  width,
  height,
  cssClass,
}) => {
  return (
    <>
      <Image
        className={cssClass}
        src={`${process.env.NEXT_PUBLIC_AIRLINE_LOGO_URL}/sm${segment.carrierCode}.gif`}
        alt={`${segment.airlineName || segment.carrierCode} logo`}
        width={width}
        height={height}
        unoptimized
      />
    </>
  );
};

export default FlightLogoImage;
