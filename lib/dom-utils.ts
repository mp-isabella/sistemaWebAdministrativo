/**
 * Utilidades seguras para manipulación del DOM
 * Previene errores de removeChild y otros problemas de DOM
 */

/**
 * Elimina un elemento del DOM de forma segura
 * @param element - El elemento a eliminar
 * @param parent - El elemento padre (opcional, se detecta automáticamente)
 */
export function safeRemoveElement(element: Element | null, parent?: Node | null): boolean {
  if (!element) return false;

  try {
    // Verificar que el elemento aún existe en el DOM
    if (!document.contains(element)) {
      return true; // Ya no existe, consideramos que se eliminó exitosamente
    }

    // Si se proporciona un padre específico, verificar que el elemento es hijo
    if (parent) {
      if (parent.contains(element)) {
        parent.removeChild(element);
        return true;
      }
      return false;
    }

    // Si no se proporciona padre, intentar con el padre actual
    if (element.parentNode && element.parentNode.contains(element)) {
      element.parentNode.removeChild(element);
      return true;
    }

    // Como último recurso, usar remove()
    element.remove();
    return true;
  } catch (error) {
    // Intentar con remove() como fallback
    try {
      if (document.contains(element)) {
        element.remove();
        return true;
      }
      return true; // Ya no existe en el DOM
    } catch (removeError) {
      console.error('Error removing element:', removeError);
      return false;
    }
  }
}

/**
 * Agrega un elemento al DOM de forma segura
 * @param parent - El elemento padre
 * @param child - El elemento hijo a agregar
 */
export function safeAppendChild(parent: Node, child: Node): boolean {
  try {
    parent.appendChild(child);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifica si un elemento existe y está conectado al DOM
 * @param element - El elemento a verificar
 */
export function isElementConnected(element: Element | null): boolean {
  if (!element) return false;

  try {
    return document.contains(element);
  } catch (error) {
    return false;
  }
}

/**
 * Limpia elementos duplicados de forma segura
 * @param selector - Selector CSS para encontrar elementos
 * @param identifier - Atributo que identifica duplicados (ej: 'data-job-id')
 */
export async function safeCleanupDuplicates(selector: string, identifier: string): Promise<number> {
  try {
    // Verificar que el documento esté listo
    if (document.readyState !== 'complete') {
      return 0;
    }

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      return 0;
    }

    const seen = new Set<string>();
    const duplicates: Element[] = [];

    // Crear una copia de la lista para evitar problemas con elementos que se eliminan
    const elementsArray = Array.from(elements);

    elementsArray.forEach((element) => {
      // Verificar que el elemento aún existe en el DOM y está conectado
      if (!document.contains(element) || !isElementConnected(element)) {
        return;
      }

      const id = element.getAttribute(identifier);
      if (id) {
        if (seen.has(id)) {
          duplicates.push(element);
        } else {
          seen.add(id);
        }
      }
    });

    let removedCount = 0;

    // Procesar duplicados en lotes para evitar conflictos
    const batchSize = 5;
    for (let i = 0; i < duplicates.length; i += batchSize) {
      const batch = duplicates.slice(i, i + batchSize);

      batch.forEach((duplicate) => {
        // Verificar múltiples veces que el elemento existe y está conectado
        if (document.contains(duplicate) && isElementConnected(duplicate)) {
          // Verificar que el elemento tiene un padre válido
          if (duplicate.parentNode && duplicate.parentNode.contains(duplicate)) {
            if (safeRemoveElement(duplicate)) {
              removedCount++;
            }
          } else {
            // Si no tiene padre válido, usar remove() directamente
            try {
              duplicate.remove();
              removedCount++;
            } catch (removeError) {
              console.error('Error removing duplicate:', removeError);
            }
          }
        }
      });

      // Pequeña pausa entre lotes para evitar conflictos
      if (i + batchSize < duplicates.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (removedCount > 0) {
    }

    return removedCount;
  } catch (error) {
    return 0;
  }
}
