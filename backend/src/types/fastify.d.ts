import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    user?: {
      id: string;
      email: string;
    };
  }
}
