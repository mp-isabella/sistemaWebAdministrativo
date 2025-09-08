"use client";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Améstica</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Inicio</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Servicios</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Contacto</a>
              <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Soluciones Profesionales en Detección de Fugas
            </h2>
            <p className="text-xl mb-8">
              28 años de experiencia en detección y reparación de fugas de agua
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Contactar Ahora
            </button>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-4">Detección de Fugas</h4>
                <p className="text-gray-600">
                  Localización precisa de fugas sin dañar estructuras
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-4">Destape de Alcantarillado</h4>
                <p className="text-gray-600">
                  Servicio profesional de destape y limpieza
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-4">Inspección de Tuberías</h4>
                <p className="text-gray-600">
                  Evaluación completa del estado de las tuberías
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold mb-8">¿Necesitas Ayuda?</h3>
            <p className="text-lg text-gray-600 mb-8">
              Contáctanos para una evaluación gratuita
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Llamar: +56 9 4200 8410
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Améstica Ltda. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
