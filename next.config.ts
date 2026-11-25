import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo afecta `next dev`: permite abrir el servidor de desarrollo desde otros
  // dispositivos de la red local (p. ej. un celular en el mismo Wi-Fi). Si la
  // IP del equipo cambia, actualízala aquí.
  allowedDevOrigins: ["192.168.1.22"],
};

export default nextConfig;
