# OBD_INTEGRATION_SPEC.md

## PROYECTO: INTEGRACIÓN OBD_CORE (NYX_BRIDGE)

### 1. OBJETIVOS
- Integrar la lógica de OBDium para comunicación universal con ELM327, J2534 y STN.
- Proporcionar telemetría en tiempo real para el modo "Car Mode".
- Implementar auditorías de seguridad en cada lectura/escritura de ECU.

### 2. PROTOCOLOS SOPORTADOS
- **ELM327 Standard:** Comandos AT vía BT/USB.
- **MS-HS CAN Switching:** Lógica para buses Ford/Mazda.
- **J2534 Passthru:** Comunicación profesional para flasheo y diagnóstico profundo.

### 3. MODALIDADES DEL AGENTE
1. **Asistida:** Visualización de datos con glosario técnico inteligente.
2. **Guiada (Misión):** El agente guía al usuario por pasos para diagnosticar una falla (ej. P0300).
3. **Autónoma:** Vigilancia 24/7. El agente genera logs y notificaciones ante anomalías detectadas en reposo o marcha.

### 4. FLUJO DE TRABAJO PARA INTEGRACIONES OPEN SOURCE
1. **Discovery:** Análisis de repo y mapeo de funciones.
2. **Abstracción:** Creación de Types e Interfaces compartidas.
3. **Context Injection:** Carga de lógica en DashboardContext.
4. **UI Adaptation:** Integración en vistas de arquitectura minimalista (Cristal Blur).
5. **Testing & Audit:** Pruebas de saturación de bus y validación de logs.
