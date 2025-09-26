
# Guía de Optimización de Dependencias

## Dependencias Removidas
- puppeteer
- chart.js
- react-chartjs-2
- framer-motion
- recharts
- embla-carousel-react
- pdfkit
- xlsx
- cloudinary
- puppeteer-core

## Alternativas Recomendadas

### Para PDFs (reemplazar puppeteer):
```bash
npm install jspdf html2canvas
```

### Para Gráficos (reemplazar chart.js):
```bash
# Usar CSS puro o librerías más ligeras
npm install recharts
# O usar CSS Grid/Flexbox para gráficos simples
```

### Para Animaciones (reemplazar framer-motion):
```bash
# Usar CSS animations o librerías más ligeras
npm install @react-spring/web
# O usar CSS puro con Tailwind
```

### Para Carousels (reemplazar embla-carousel):
```bash
# Usar CSS puro o implementación simple
# O usar Swiper.js que es más ligero
npm install swiper
```

## Implementación

1. **Backup**: Se creó package.json.backup
2. **Optimizado**: Se creó package-optimized.json
3. **Aplicar**: Copia package-optimized.json sobre package.json
4. **Instalar**: npm install
5. **Probar**: npm run build

## Verificación

```bash
# Verificar tamaño del bundle
npm run build
npx @next/bundle-analyzer

# Verificar que no hay errores
npm run type-check
npm run lint
```
