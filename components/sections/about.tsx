'use client';
import { Users, Award, Shield } from "lucide-react";
import React, { useEffect } from "react";

const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  soft: "#5692C8",
  light: "#9ABCE1",
  extraLight: "#C4E9F9",
  highlight: "#F46015",
  white: "#FFFFFF",
};

interface Stat {
  icon: React.ReactNode;
  number: string;
  label: string;
  iconColor: string;
}

const About: React.FC = () => {
  const stats: Stat[] = [
    { icon: <Users className="h-8 w-8" />, number: "+65.000", label: "Clientes satisfechos", iconColor: colors.highlight },
    { icon: <Award className="h-8 w-8" />, number: "+28", label: "Años de experiencia", iconColor: colors.strong },
    { icon: <Shield className="h-8 w-8" />, number: "100%", label: "Trabajos garantizados", iconColor: colors.dark },
  ];

  // Scroll suave para todos los enlaces de la página
  useEffect(() => {
    const handleSmoothScroll = (event: Event) => {
      const target = event.currentTarget as HTMLAnchorElement;
      if (target.hash) {
        event.preventDefault();
        const section = document.querySelector(target.hash);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => link.addEventListener('click', handleSmoothScroll));

    return () => {
      links.forEach(link => link.removeEventListener('click', handleSmoothScroll));
    };
  }, []);

  return (
    <section id="about" className="min-h-screen flex items-center py-32 bg-white relative overflow-hidden">
      {/* Elemento decorativo */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-extraLight rounded-full opacity-50" 
           style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)' }}></div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-justify">
          {/* Texto */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight" style={{ color: colors.dark }}>
              ¿Quiénes somos?
            </h2>
            <div className="space-y-6 text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
              <p>
                Améstica Ltda. es una empresa con 28 años de experiencia, especializada en la detección y reparación de fugas de agua intradomiciliarias, destape de alcantarillado e inspección de tuberías. Nos enfocamos en entregar soluciones eficientes y confiables, utilizando tecnología de punta para localizar problemas de manera precisa y sin dañar estructuras, atendiendo tanto a clientes residenciales como comerciales con un servicio profesional, rápido y seguro.
              </p>
            </div>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: colors.strong }}>Misión</h3>
                <p className="text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
                  Brindar servicios de detección y reparación de fugas, destape de alcantarillado e inspección de tuberías con eficiencia, confiabilidad y profesionalismo, utilizando tecnología avanzada y garantizando la integridad de las instalaciones de nuestros clientes.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: colors.strong }}>Visión</h3>
                <p className="text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
                  Ser reconocidos como la empresa líder en soluciones de fugas de agua y mantenimiento de tuberías, destacando por nuestra innovación tecnológica, calidad de servicio y compromiso con la satisfacción de nuestros clientes, promoviendo el uso responsable del agua y la eficiencia en sus instalaciones.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative border-l-2 border-dashed pl-12" style={{ borderColor: colors.extraLight }}>
            {stats.map((stat, index) => (
              <div key={index} className="flex items-start mb-12 relative group">
                <div className="absolute -left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-125" 
                     style={{ backgroundColor: stat.iconColor, color: colors.white }}>
                  {stat.icon}
                </div>
                <div className="pl-8">
                  <div className="text-6xl font-bold mb-2 transition-all duration-300 ease-in-out" style={{ color: colors.dark }}>
                    {stat.number}
                  </div>
                  <div className="text-xl font-medium" style={{ color: colors.medium }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
