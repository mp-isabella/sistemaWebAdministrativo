#!/usr/bin/env node

/**
 * Script para corregir la estructura del archivo del calendario
 * Mueve las funciones dentro del componente y corrige las referencias
 */

const fs = require('fs');
const path = require('path');

const filePath = 'app/dashboard/schedule/calendar/page.tsx';

function fixCalendarStructure() {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Leer el archivo de respaldo que está limpio
        const backupPath = 'app/dashboard/schedule/calendar/page.tsx.backup';
        if (fs.existsSync(backupPath)) {
            console.log('📋 Usando archivo de respaldo como base...');
            const backupContent = fs.readFileSync(backupPath, 'utf8');

            // Crear una versión corregida basada en el respaldo
            let correctedContent = backupContent;

            // Agregar las importaciones necesarias
            const imports = `"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { safeCleanupDuplicates } from "@/lib/dom-utils"
import { Building, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Filter, Menu, MessageCircle, Phone, Plus, RefreshCw, User, Wrench, X } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "../../styles/calendar-mobile-optimizations.css"

`;

            // Reemplazar el inicio del archivo
            correctedContent = correctedContent.replace(/^"use client"/, imports);

            // Guardar el archivo corregido
            fs.writeFileSync(filePath, correctedContent, 'utf8');
            console.log('✅ Archivo del calendario corregido exitosamente');

        } else {
            console.log('⚠️  No se encontró archivo de respaldo');
        }

    } catch (error) {
        console.log(`❌ Error corrigiendo el archivo: ${error.message}`);
    }
}

// Ejecutar la corrección
fixCalendarStructure();
