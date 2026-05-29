import { useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';

export const useNyxDaemon = () => {
  const ws = useRef<WebSocket | null>(null);
  const { setNyxConnection, updateTelemetry, daemonPort } = useAppStore();

  const connect = useCallback((endpoint: string = '/telemetry') => {
    // Evitar conexiones duplicadas a lo p*ndejo
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    const url = `ws://127.0.0.1:${daemonPort}${endpoint}`;
    console.log(`[NYX CORE] Intentando enlace neural en ${url}...`);
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[NYX CORE] Enlace establecido.');
        setNyxConnection(true);
        
        // Si nos conectamos al handshake, pedimos autorización inmediata
        if (endpoint === '/handshake') {
          ws.current?.send(JSON.stringify({ intent: 'HANDSHAKE_INIT' }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          // Rutear telemetría (Batería, latencia)
          if (payload.battery !== undefined || payload.latency_ms !== undefined) {
            updateTelemetry(payload);
          }
          
          // Rutear respuestas de autorización
          if (payload.status === 'authorized') {
            console.log('[NYX CORE] Autorización confirmada. Puertos abiertos.');
          }

          // Rutear confirmación de tareas físicas (!GO NYX)
          if (payload.action === 'TASK_COMPLETE' || payload.status === 'success') {
            console.log('[NYX CORE] Ejecución física completada:', payload.msg || payload.data);
            // Aquí luego ataremos alertas visuales para la UI
          }

        } catch (err) {
          console.error('[NYX CORE] Payload basura recibido:', event.data);
        }
      };

      ws.current.onclose = () => {
        console.warn('[NYX CORE] Conexión perdida. Reintentando en 5s...');
        setNyxConnection(false);
        updateTelemetry({ status: 'offline' });
        
        // Bucle de reconexión obstinada
        setTimeout(() => connect(endpoint), 5000);
      };

      ws.current.onerror = (error) => {
        console.error('[NYX CORE] Falla crítica en el socket:', error);
        ws.current?.close();
      };
    } catch (e) {
      console.error('[NYX CORE] Excepcion al instanciar WebSocket:', e);
      setNyxConnection(false);
      updateTelemetry({ status: 'offline' });
      setTimeout(() => connect(endpoint), 5000);
    }
  }, [daemonPort, setNyxConnection, updateTelemetry]);

  // Exponer método para disparar comandos desde cualquier componente
  const sendCommand = useCallback((intent: string, payload: any = {}) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ intent, ...payload }));
    } else {
      console.error('[NYX CORE] Socket desconectado. Imposible enviar orden.');
    }
  }, []);

  return { connect, sendCommand };
};
