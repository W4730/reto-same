# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack
Expo SDK 58 (React Native 0.88, expo-router), must run in Expo Go. Backend Supabase. Ver docs/superpowers/specs/2026-11-25-reto-same-app-design.md.

## Users
- **Voluntarios de Reto Same:** registran nidos de tortuga marina de noche en la playa de Same (Esmeraldas, Ecuador), de pie sobre la arena, a menudo solos, con señal que se cae sin aviso. Teléfonos Android.
- **Coordinador (Alan Miranda):** revisa y valida cada registro (foto + ubicación), cambia el estado del nido.

## Product Purpose
Reemplazar el mapa de Google Earth donde hoy se registran los nidos. Éxito: quien usó el mapa anterior nota la mejora desde el primer registro: registrar es más rápido y los datos llegan limpios.

## Operating Context
Noche, arena, manos ocupadas o con guantes, linternas de luz roja, sol fuerte de día. El GPS del móvil es impreciso: Alan se para encima del nido y espera. Registros se guardan sin señal y se envían al volver la conexión.

## Capabilities and Constraints
- Registro en 3 pasos: ubicación (± m visible) → foto con cámara (no galería) → confirmar. Fecha y hora automáticas. Especie, huella y notas opcionales.
- Código corto por nido (S26-0142). Estados: pendiente, activo, próximo a eclosionar, eclosionado, perdido. Ventana de eclosión 45–60 días, como rango.
- Ubicación bloqueada tras validar.
- Por confirmar con Alan: estado "reubicado", si el modo nocturno es obligatorio, nombres reales de los sectores.

## Brand Commitments
Fundación Reto Same, lema "Conectados con el mar". Logo PNG circular (handout §2). Paleta y tipografía definidas en handout.md §3–4 y §10 (Montserrat 700 titulares, Roboto cuerpo, Azul Reto #194171, Turquesa Oscuro #0F7480 para botones). Voz en tuteo, cercana, arraigada en Same/Tonchigüe/Atacames.

## Evidence on Hand
Handout.md con cifras públicas que **no cuadran** entre páginas (§9): no mostrar cifras sin validar. Sin fotos propias en el repo todavía.

## Product Principles
1. Pocos toques y nada que el voluntario pueda equivocar: lo que el teléfono sabe, lo llena solo.
2. Sin señal es el caso normal, no la excepción. El voluntario siempre sabe qué falta por enviar.
3. Un dato validado no se mueve.
4. El mapa es abierto: la fundación quiere ver dónde se concentran los nidos (objetivo de su investigación). Decidido el 25 nov 2026.

## Accessibility & Inclusion
Estados distinguibles por forma y color (daltonismo, sol fuerte). Objetivos táctiles grandes. Texto funcional nunca bajo peso 400.
