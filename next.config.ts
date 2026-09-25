import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  // O indicador do modo dev fica à direita para não cobrir o rodapé da barra lateral.
  devIndicators: { position: "bottom-right" },
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
