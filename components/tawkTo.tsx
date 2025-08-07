"use client";

import { useEffect } from "react";

export default function TawkTo() {
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src = "https://embed.tawk.to/688e602e37c8b4192bd90d45/1j1m2fdn7";
    s1.async = true;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);

    return () => {
      document.body.removeChild(s1);
    };
  }, []);

  return null;
}
