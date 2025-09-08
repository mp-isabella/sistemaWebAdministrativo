# Implementación de Globos Flotantes - Sitio Web Améstica

## Descripción General

Se han implementado globos flotantes idénticos a la imagen de referencia con funcionalidad completa para WhatsApp, llamadas y chatbot. Los globos están posicionados fijamente en el costado derecho de la pantalla y se desplazan suavemente con el scroll.

## Características Implementadas

### ✅ Requisitos Cumplidos

1. **Posicionamiento Fijo**: Los globos están fijos al costado derecho y se desplazan con el scroll
2. **Animación Flotante**: Efecto suave de "sube y baja" con timing escalonado
3. **Funcionalidad de Clic**:
   - **WhatsApp**: Panel emergente con números de Santiago y Ñuble
   - **Llamadas**: Panel emergente con números para llamar directamente
   - **Chatbot**: Ventana de chat simulada con opciones interactivas
4. **Gestión de Modales**: Solo un panel abierto a la vez, cierre automático al hacer clic fuera
5. **Diseño Responsivo**: Adaptación automática para desktop y móviles
6. **Estilos Modernos**: Colores específicos de cada app, sombras y efectos hover

### 🎨 Diseño Visual

- **WhatsApp**: Verde (#25D366) con gradiente
- **Llamadas**: Azul (#007AFF) con gradiente  
- **Chatbot**: Naranja (#FF6B35) con gradiente
- **Tamaños**: 60px desktop, 45px móvil
- **Sombras**: Efectos de profundidad con rgba(0, 0, 0, 0.25)

### 📱 Responsividad

- **Desktop (>1024px)**: Costado derecho, tamaño 60px
- **Tablet (769px-1024px)**: Costado derecho, tamaño 56px
- **Móvil (≤768px)**: Parte inferior derecha, tamaño 45px

## Archivos Modificados

### 1. `components/floating-buttons.tsx`
- Componente principal con lógica de estado
- Gestión de modales y interacciones
- Integración con números de contacto

### 2. `app/floating-buttons.css`
- Estilos completos con Tailwind CSS
- Animaciones flotantes y transiciones
- Media queries para responsividad

### 3. `app/page.tsx`
- Integración del componente en la página principal
- Posicionamiento después del Footer

### 4. `app/layout.tsx`
- Importación del CSS de floating-buttons

## Funcionalidades Técnicas

### 🔧 Gestión de Estado
```typescript
const [showPhoneModal, setShowPhoneModal] = useState(false);
const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
const [showChatbotModal, setShowChatbotModal] = useState(false);
```

### 🎯 Cierre Automático de Modales
- Función `closeOtherModals()` para cerrar otros paneles
- `useRef` y `useEffect` para detectar clics fuera del modal
- Cierre automático al abrir un nuevo modal

### 📞 Números de Contacto
```typescript
const contactNumbers = {
  santiago: "+56 9 4200 8410",
  ñuble: "+56 9 9670 6640",
};
```

### 🎭 Animaciones CSS
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.floating-button:nth-child(1) { animation-delay: 0s; }
.floating-button:nth-child(2) { animation-delay: 0.5s; }
.floating-button:nth-child(3) { animation-delay: 1s; }
```

## Uso del Componente

### Importación
```typescript
import FloatingButtons from '@/components/floating-buttons';
```

### Implementación
```typescript
<FloatingButtons />
```

### Props Opcionales
```typescript
interface FloatingButtonsProps {
  phoneNumber?: string;    // Número de teléfono por defecto
  whatsappNumber?: string; // Número de WhatsApp por defecto
}
```

## Características del Chatbot

### 💬 Panel de Chat
- Mensaje de bienvenida con avatar robot
- 4 opciones predefinidas:
  - 📋 Solicitar cotización
  - 🛠️ Agendar servicio
  - 📞 Contactar técnico
  - 💰 Consultar precios
- Footer informativo con enlaces alternativos

### 🎨 Estilos del Chatbot
- Diseño similar a WhatsApp/Telegram
- Colores naranjas consistentes con el botón
- Hover effects y transiciones suaves

## Optimizaciones Implementadas

### 🚀 Performance
- `will-change: transform` para optimizar animaciones
- `useCallback` para funciones de manejo de eventos
- Lazy loading de modales

### 📱 Accesibilidad
- `aria-label` para cada botón
- `title` attributes para tooltips
- Navegación por teclado
- Contraste de colores optimizado

### 🎯 UX/UI
- Feedback visual inmediato en hover
- Transiciones suaves entre estados
- Cierre intuitivo de modales
- Diseño consistente con la marca

## Personalización

### 🎨 Cambiar Colores
```css
.floating-button.whatsapp {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
}

.floating-button.phone {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
}

.floating-button.chatbot {
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
}
```

### 📏 Ajustar Tamaños
```css
.floating-button {
  width: 4rem;    /* 60px */
  height: 4rem;   /* 60px */
}

@media (max-width: 768px) {
  .floating-button {
    width: 3.5rem;   /* 45px */
    height: 3.5rem;  /* 45px */
  }
}
```

### ⚡ Modificar Animaciones
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }  /* Cambiar -8px para más/menos movimiento */
}

.floating-button {
  animation: float 3s ease-in-out infinite;  /* Cambiar 3s para velocidad */
}
```

## Troubleshooting

### ❌ Problemas Comunes

1. **Botones no se muestran**: Verificar que el CSS esté importado en `layout.tsx`
2. **Animaciones no funcionan**: Verificar que no haya conflictos con otros estilos
3. **Modales no se cierran**: Verificar que el `useRef` esté configurado correctamente

### 🔧 Soluciones

1. **Reiniciar servidor de desarrollo**: `npm run dev`
2. **Limpiar cache**: `npm run build && npm run dev`
3. **Verificar consola del navegador** para errores JavaScript

## Próximas Mejoras

### 🚀 Funcionalidades Futuras
- Integración con API de WhatsApp Business
- Chatbot con IA real (OpenAI, etc.)
- Analytics de interacciones
- Personalización por región/idioma
- Modo oscuro/claro

### 📱 Mejoras de UX
- Gestos táctiles para móviles
- Animaciones más elaboradas
- Sonidos de notificación
- Modo de accesibilidad mejorado

---

**Estado**: ✅ Implementado y Funcionando  
**Última Actualización**: Diciembre 2024  
**Versión**: 1.0.0
