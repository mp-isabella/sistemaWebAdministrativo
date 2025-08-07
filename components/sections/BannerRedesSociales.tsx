"use client"

export default function ServicesBanner() {
  const services = [
    "Cobertura nacional con tecnología de calidad",
    "Llegamos a donde nos necesites. Atención en Santiago, Ñuble y otras regiones del país",
    "Lunes a viernes 8:00 - 20:00 | Sábado 9:00 - 19:00",
    "Síguenos en nuestras redes sociales",
    "Entérate de nuestras novedades, servicios y cobertura en todo Chile",
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
