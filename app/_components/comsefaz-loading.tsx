"use client"; // se estiver usando Next.js App Router

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LoadingComsefazProps {
  width?: number;
  height?: number;
}

const LoadingComsefaz = ({ width, height }: LoadingComsefazProps) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/comsefaz-loading.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return null;

  return (
    <div className="flex items-center justify-center h-full">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: width, height: height }}
      />
    </div>
  );
};

export default LoadingComsefaz;
