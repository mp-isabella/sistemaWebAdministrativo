export const REGIONES_Y_COMUNAS = {
  "Metropolitana": [
    "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
    "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana",
    "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
    "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura",
    "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura",
    "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo",
    "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto",
    "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
  ],
  "Valparaíso": [
    "Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero",
    "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban",
    "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "La Calera",
    "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco",
    "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo",
    "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"
  ],
  "O'Higgins": [
    "Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras",
    "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco",
    "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue",
    "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua",
    "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"
  ],
  "Maule": [
    "Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue",
    "Río Claro", "San Clemente", "San Rafael", "Curicó", "Hualañé", "Licantén", "Molina",
    "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún",
    "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas",
    "Cauquenes", "Chanco", "Pelluhue"
  ],
  "Ñuble": [
    "Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón",
    "San Ignacio", "Yungay", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue",
    "Ránquil", "Treguaco", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"
  ],
  "Bío Bío": [
    "Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco",
    "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu",
    "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles",
    "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco",
    "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Bío Bío"
  ]
} as const;

// Tipos TypeScript para mejor tipado
export type RegionName = keyof typeof REGIONES_Y_COMUNAS;
export type CommuneName = typeof REGIONES_Y_COMUNAS[RegionName][number];

// Función helper para obtener comunas de una región
export const getCommunesByRegion = (region: RegionName): string[] => {
  return [...(REGIONES_Y_COMUNAS[region] || [])];
};

// Función helper para obtener todas las regiones
export const getAllRegions = (): readonly RegionName[] => {
  return Object.keys(REGIONES_Y_COMUNAS) as RegionName[];
};

// Función helper para verificar si una comuna pertenece a una región
export const isCommuneInRegion = (region: RegionName, commune: string): boolean => {
  const communes = REGIONES_Y_COMUNAS[region];
  return communes ? [...communes].includes(commune as any) : false;
};
