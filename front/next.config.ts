import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Libera o dev server para acesso a partir de outra maquina da rede.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.99.20", "192.168.99.21"],

  experimental: {
    /*
      As imagens (foto de perfil, do artista, capa de album e de playlist) vao
      no corpo da Server Action como data URI base64, que infla o arquivo em
      ~33%. Com o limite padrao de 1MB, uma imagem de 1MB ja estoura. O backend
      aceita ate 2MB, entao 4MB aqui cobre o base64 com folga.
    */
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
