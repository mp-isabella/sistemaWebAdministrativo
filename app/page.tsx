'use client';

import FloatingButtons from '@/components/ui/floating-buttons';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import TopBar from '@/components/sections/TopBar';

import Hero from '@/components/sections/hero';
import Services from '@/components/sections/services';
import About from '@/components/sections/about';
import Gallery from '@/components/sections/gallery';
import FAQ from '@/components/sections/faq';
import Testimonials from '@/components/sections/testimonials';
import Contact from '@/components/sections/contact';
import BannerRedesSociales from '@/components/sections/BannerRedesSociales';
import BannerLogos from '@/components/sections/BannerLogos';
import BannerTexto from '@/components/sections/BannerTexto';

const sections = [
  { id: 'hero', component: Hero },
  { id: 'social-media', component: BannerRedesSociales },
  { id: 'about', component: About },
  { id: 'services', component: Services },
  { id: 'social-media-2', component: BannerRedesSociales },
  { id: 'gallery', component: Gallery },
  { id: 'text-banner-2', component: BannerTexto },
  { id: 'testimonials', component: Testimonials },
  { id: 'faq', component: FAQ },
  { id: 'logos', component: BannerLogos },
  { id: 'contact', component: Contact },
];

export default function Page() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-grow">
        {sections.map(({ id, component: Section }) => (
          <Section key={id} />
        ))}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
