# 🚀 Configuración FormSubmit con Template URL - Guía Rápida

## 🎯 Objetivo
Configurar FormSubmit con una plantilla HTML personalizada usando GitHub Gist para obtener el diseño más armonioso posible.

## ⚡ Pasos Rápidos (5 minutos)

### Paso 1: Subir Plantilla a GitHub Gist

1. **Ve a GitHub Gist:**
   - Abre: https://gist.github.com
   - Haz clic en "Sign in" si no tienes cuenta (es gratis)

2. **Crear nuevo Gist:**
   - Haz clic en "Create a new gist"
   - **Filename:** `formsubmit-template.html`
   - **Content:** Copia TODO el contenido del archivo `formsubmit-optimized-template.html`
   - **Visibility:** Selecciona "Create public gist"
   - Haz clic en "Create public gist"

3. **Obtener URL:**
   - Una vez creado, haz clic en "Raw"
   - Copia la URL completa (algo como: `https://gist.githubusercontent.com/tu-usuario/abc123/raw/formsubmit-template.html`)

### Paso 2: Configurar tu Formulario

Agrega estos campos ocultos a tu formulario:

```html
<form action="https://formsubmit.co/tu-email@gmail.com" method="POST">
    <!-- Configuración de FormSubmit -->
    <input type="hidden" name="_template" value="https://gist.githubusercontent.com/tu-usuario/abc123/raw/formsubmit-template.html">
    <input type="hidden" name="_subject" value="🔥 Nueva Cotización: {{servicio}} - {{nombre}}">
    <input type="hidden" name="_next" value="https://tu-sitio.com/gracias">
    <input type="hidden" name="_captcha" value="false">
    
    <!-- Campos del formulario (nombres exactos) -->
    <input type="text" name="nombre" placeholder="Nombre completo" required>
    <input type="email" name="correo_electronico" placeholder="Correo electrónico" required>
    <input type="tel" name="telefono" placeholder="Teléfono" required>
    <input type="text" name="region" placeholder="Región" required>
    <input type="text" name="comuna" placeholder="Comuna" required>
    <input type="text" name="direccion" placeholder="Dirección" required>
    <input type="text" name="servicio" placeholder="Tipo de servicio" required>
    <textarea name="mensaje" placeholder="Mensaje adicional"></textarea>
    
    <button type="submit">Enviar Cotización</button>
</form>
```

### Paso 3: Verificar Nombres de Campos

**IMPORTANTE:** Los nombres de los campos deben coincidir exactamente:

- ✅ `nombre` (no "name" o "nombre_completo")
- ✅ `correo_electronico` (no "email" o "correo")
- ✅ `telefono` (no "phone" o "tel")
- ✅ `region` (no "región" con tilde)
- ✅ `comuna`
- ✅ `direccion` (no "dirección" con tilde)
- ✅ `servicio`
- ✅ `mensaje`

## 🎨 Características del Diseño Armonioso

### ✨ **Paleta de Colores Profesional:**
- **Primario:** Azul corporativo (#3b82f6)
- **Secundario:** Grises suaves (#f8fafc, #e2e8f0)
- **Acentos:** Azul claro para mensajes (#0ea5e9)
- **Texto:** Grises oscuros para excelente legibilidad

### 🎯 **Elementos de Diseño:**
- **Gradientes suaves** en el header
- **Sombras sutiles** para profundidad
- **Bordes redondeados** para modernidad
- **Espaciado consistente** para armonía
- **Tipografía moderna** (system fonts)
- **Iconos emoji** para claridad visual

### 📱 **Responsive Design:**
- **Adaptable** a todos los dispositivos
- **Legible** en móviles y desktop
- **Optimizado** para clientes de email

## 🔧 Configuración Avanzada (Opcional)

### Campos Adicionales de FormSubmit:

```html
<!-- Redirección después del envío -->
<input type="hidden" name="_next" value="https://tu-sitio.com/gracias">

<!-- Página de error personalizada -->
<input type="hidden" name="_error" value="https://tu-sitio.com/error">

<!-- Desactivar captcha -->
<input type="hidden" name="_captcha" value="false">

<!-- Asunto personalizado -->
<input type="hidden" name="_subject" value="🔥 Nueva Cotización: {{servicio}} - {{nombre}}">

<!-- Reply-to personalizado -->
<input type="hidden" name="_replyto" value="{{correo_electronico}}">
```

## ✅ Verificación

### Para Probar:
1. **Envía un formulario** desde tu sitio web
2. **Revisa tu email** - debería verse con el nuevo diseño
3. **Verifica en móvil** que se adapte correctamente
4. **Confirma** que todos los campos se muestren

### Si No Funciona:
- ✅ **Verifica la URL** del Gist (debe ser "Raw")
- ✅ **Confirma** que el Gist sea público
- ✅ **Revisa** que los nombres de campos coincidan
- ✅ **Prueba** accediendo directamente a la URL del Gist

## 🎯 Resultado Esperado

Con esta configuración obtendrás:

- **Email profesional** con diseño moderno
- **Colores armoniosos** y corporativos
- **Estructura clara** y fácil de leer
- **Diseño responsivo** para todos los dispositivos
- **Branding consistente** con tu sitio web

## 🚨 Notas Importantes

1. **GitHub Gist debe ser público** para que FormSubmit pueda acceder
2. **La URL debe ser "Raw"** (no la URL normal del Gist)
3. **Los nombres de campos** deben coincidir exactamente
4. **FormSubmit puede tardar** unos minutos en aplicar la plantilla

¡Listo! Con estos pasos tendrás un email con diseño profesional y armonioso.
