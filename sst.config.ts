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

    return {
      api: api.url
    }
  },
});
