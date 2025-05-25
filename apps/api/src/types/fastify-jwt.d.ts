// apps/api/src/types/fastify-jwt.d.ts
import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    // Interface para o objeto que você passa para jwtSign()
    payload: {
      sub: string;
      cpf: string; // Obrigatório, pois você sempre o inclui
      email?: string | null; // Mantido opcional se puder ser nulo/ausente
      cracha: string; // Obrigatório, se você sempre o inclui (como no seu login)
      // Adicione quaisquer outros campos customizados que você assina no token
    };
    // Interface para o objeto que fica disponível em request.user após jwtVerify()
    user: {
      sub: string;
      cpf: string; // Estará aqui se estiver no payload
      email?: string | null;
      cracha: string; // Estará aqui se estiver no payload
      iat: number; // Adicionado automaticamente pelo @fastify/jwt
      exp: number; // Adicionado automaticamente pelo @fastify/jwt
      // Quaisquer outros campos do payload também estarão aqui
    };
  }
}
