import { createFastifyInstance } from ".";

const fastify = createFastifyInstance();
fastify.listen({ host: "127.0.0.1", port: 3000 });
