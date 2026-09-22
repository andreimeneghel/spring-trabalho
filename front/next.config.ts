import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Libera o dev server para acesso a partir de outra maquina da rede.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.99.20", "192.168.99.21"],
};

export default nextConfig;
