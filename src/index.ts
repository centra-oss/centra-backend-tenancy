import Fastify, { FastifyInstance } from "fastify";
import { prismaPlugin } from "./plugins/prisma";
import metricsPlugin from "fastify-metrics";
import corsPlugin from "@fastify/cors";
import ratelimitPlugin from "@fastify/rate-limit";
import swaggerPlugin from "@fastify/swagger";
import sentryPlugin from "@immobiliarelabs/fastify-sentry";

export function createFastifyInstance(): FastifyInstance {
  const environment = process.env.NODE_ENV;

  const fastify = Fastify({
    logger: {
      transport:
        environment === "development"
          ? {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
                singleLine: true,
              },
            }
          : {
              target: "pino-loki",
              options: {
                batching: true,
                interval: 2,
                labels: {
                  application: "centra-backend-api",
                  environment,
                },

                host: process.env.LOKI_HOST!,
                basicAuth: {
                  username: process.env.LOKI_USER!,
                  password: process.env.LOKI_PASS!,
                },
              },
            },
    },
  });

  fastify.register(corsPlugin, {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  fastify.register(ratelimitPlugin, {
    max: 100,
    timeWindow: "1 minute",
  });

  fastify.register(swaggerPlugin, {
    routePrefix: "/api/docs",
    openapi: {
      info: {
        title: "Centra API",
        version: "1.0.0",
      },
      openapi: "3",
      security: [{ apiKey: [] }],
    },
    hideUntagged: true,
  });

  if (process.env.NODE_ENV !== "development" && process.env.SENTRY_DSN) {
    fastify.register(sentryPlugin, {
      dsn: process.env.SENTRY_DSN!,
      environment: process.env.NODE_ENV!,
      release: "1.0.0",
      allowedStatusCodes: [404, 400],
    });
  }

  fastify.register(prismaPlugin);

  fastify.register(metricsPlugin, { endpoint: "/metrics" });

  return fastify;
}
