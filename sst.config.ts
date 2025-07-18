/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "certificate-verifier",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {

    const api = new sst.aws.Function("api",{
      handler: "apps/api/handler.handler",
      url: true,
      environment: {
        API_NETWORK_URL: process.env.API_NETWORK_URL as string,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
        PRIVATE_KEY: process.env.PRIVATE_KEY as string,
      }
    })

    // Deploy del frontend
    const website = new sst.aws.StaticSite("website", {
      path: "apps/certificate-verifier-app",
      build: {
        command: "bun run build",
        output: "dist"
      },
      environment: {
        // Variables de entorno que se inyectan en build time
        VITE_API_BACKEND_URL_BASE: $interpolate`${api.url}/api`,
      },
      // domain: {
        // Opcional: si quieres un dominio personalizado
        // name: "certificate-verifier.tudominio.com",
        // redirects: ["www.certificate-verifier.tudominio.com"]
      // }
    });

    return {
      api: api.url,
      website: website.url
    }
  },
});
