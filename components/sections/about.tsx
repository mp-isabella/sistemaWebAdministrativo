import { Users, Award, Clock, Shield } from "lucide-react";
import React from "react";

// Paleta de colores para un uso más limpio en Tailwind CSS
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

// Definición de tipos para las estadísticas
interface Stat {
  icon: React.ReactNode;
  number: string;
  label: string;
  iconColor: string;
}

export default function About() {
  const stats: Stat[] = [
    {
      icon: <Users className="h-8 w-8" />,
      number: "+500",
      label: "Clientes Satisfechos",
      iconColor: colors.highlight,
    },
    {
      icon: <Award className="h-8 w-8" />,
      number: "+15",
      label: "Años de Experiencia",
      iconColor: colors.strong,
    },
    {
      icon: <Clock className="h-8 w-8" />,
      number: "+300",
      label: "Servicio de Emergencia",
      iconColor: colors.soft,
    },
    {
      icon: <Shield className="h-8 w-8" />,
      number: "100%",
      label: "Trabajos Garantizados",
      iconColor: colors.dark,
    },
  ];

  return (
    // Reducción del padding vertical para disminuir el alto
    <section id="nosotros" className="py-24 bg-white relative overflow-hidden">
      {/* Elemento decorativo en la esquina superior izquierda */}
      <div 
        className="absolute -top-16 -left-16 w-80 h-80 bg-extraLight rounded-full opacity-50" 
        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)' }}
      ></div>
      
      <div className="container mx-auto px-4">
        {/* Reducción del gap entre las dos columnas */}
        <div className="grid lg:grid-cols-2 gap-16 items-center text-justify">
          {/* Texto Informativo */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight" style={{ color: colors.dark }}>
              ¿Quiénes Somos?
            </h2>
            <div className="space-y-6 text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
              <p>
                Somos una empresa especializada en detección y reparación de fugas de agua, con más de 15 años de experiencia ofreciendo soluciones eficientes, sin dañar estructuras.
              </p>
            </div>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: colors.strong }}>
                  Nuestra Misión
                </h3>
                <p className="text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
                  Brindar soluciones integrales en gasfitería utilizando innovación tecnológica, excelencia técnica y atención personalizada.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: colors.strong }}>
                  Nuestra Visión
                </h3>
                <p className="text-lg leading-relaxed font-normal" style={{ color: colors.medium }}>
                  Ser referentes a nivel nacional en servicios de detección de fugas, por calidad, confianza y eficiencia.
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas - Diseño Novedoso */}
          <div className="relative border-l-2 border-dashed pl-12" style={{ borderColor: colors.extraLight }}>
            {stats.map((stat, index) => (
              // Reducción del margen inferior de cada stat
              <div key={index} className="flex items-start mb-12 relative group">
                {/* Círculo de conexión */}
                <div 
                  className="absolute -left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-125" 
                  style={{ backgroundColor: stat.iconColor, color: colors.white }}
                >
                  {stat.icon}
                </div>
                
                {/* Contenido de la estadística */}
                <div className="pl-8">
                  <div 
                    className="text-6xl font-bold mb-2 transition-all duration-300 ease-in-out" 
                    style={{ color: colors.dark }}
                  >
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
}