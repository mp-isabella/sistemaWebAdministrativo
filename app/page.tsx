"use client";

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import Services from '@/components/sections/services';
import About from '@/components/sections/about';
import Contact from '@/components/sections/contact';
import BannerRedesSociales from '@/components/sections/BannerRedesSociales';
import BannerLogos from '@/components/sections/BannerLogos';
import BannerTexto from '@/components/sections/BannerTexto';
import FAQ from "@/components/sections/faq";
import Gallery from "@/components/sections/gallery";
import Testimonials from "@/components/sections/testimonials";

export default function Page() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <BannerRedesSociales />
        <About />
        <Services />
        <BannerRedesSociales />
        <Gallery />
        <BannerTexto />
        <Testimonials />
        <FAQ />
        <BannerLogos />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
