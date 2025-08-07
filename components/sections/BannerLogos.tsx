"use client"

export default function BannerLogos() {
  const services = [
      "Comprometidos con la calidad y cobertura nacional para cada cliente.",

  "Confía en nosotros para soluciones rápidas y efectivas donde lo necesites.",
  "Estamos aquí para ayudarte de lunes a sábado, en horarios extendidos.",
  "Conéctate con nosotros y descubre cómo podemos ayudarte en todo Chile.",
  "Experiencia y profesionalismo respaldan cada servicio que ofrecemos."
  ]

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* First set of services */}
        <div className="flex items-center space-x-8 mx-8">
          {services.map((service, index) => (
            <div key={index} className="flex items-center space-x-8">
              <span className="text-white text-lg font-medium">{service}</span>
              <span className="text-white text-2xl">✱</span>
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless loop */}
        <div className="flex items-center space-x-8 mx-8">
          {services.map((service, index) => (
            <div key={`duplicate-${index}`} className="flex items-center space-x-8">
              <span className="text-white text-lg font-medium">{service}</span>
              <span className="text-white text-2xl">✱</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
