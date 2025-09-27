"use client";

import React, { useState, forwardRef } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  alt: string;
}

const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(({
  src,
  alt,
  fallbackSrc = "/placeholder.jpg",
  ...props
}, ref) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      ref={ref}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
});

SafeImage.displayName = "SafeImage";

export default SafeImage;
