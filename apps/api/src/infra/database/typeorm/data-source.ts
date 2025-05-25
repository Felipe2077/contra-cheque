// contracheque-app/apps/api/src/infra/database/typeorm/data-source.ts
import { env } from '@/config/env'; // Nosso validador de env
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Paystub } from './entities/paystub.entity';
// Importe suas entidades aqui no futuro
// import { User } from './entities/user.entity';
// Importe suas migrações aqui no futuro
// import { CreateUsersTable1620000000000 } from './migrations/1620000000000-CreateUsersTable';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL, // Vem do nosso .env (ex: postgresql://user:pass@host:port/db)
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Ajuste para produção se necessário

  // Sincronização deve ser false em produção! Use migrações.
  // synchronize: env.NODE_ENV === 'development', // Apenas para desenvolvimento inicial, para criar tabelas automaticamente
  synchronize: false, // Apenas para desenvolvimento inicial, para criar tabelas automaticamente

  logging: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],

  entities: [Employee, Paystub],
  migrations: [
    // CreateUsersTable1620000000000,
    // Adicione outras migrações aqui
    // Pode usar glob patterns: join(__dirname, './migrations/**/*{.ts,.js}')
    // __dirname + '/migrations/**/*.{ts,js}'
    'src/infra/database/typeorm/migrations/**/*{.ts,.js}',
  ],
  migrationsTableName: 'typeorm_migrations', // Nome da tabela que guarda o histórico de migrações
  // cli: { // Configuração para o CLI do TypeORM, se usar comandos typeorm diretamente
  //   entitiesDir: 'src/infra/database/typeorm/entities',
  //   migrationsDir: 'src/infra/database/typeorm/migrations',
  // },
};

export const AppDataSource = new DataSource(dataSourceOptions);

// Função para inicializar a conexão
export const initializeDataSource = async () => {
  if (AppDataSource.isInitialized) {
    console.log('Data Source has already been initialized!');
    return AppDataSource;
  }
  try {
    await AppDataSource.initialize();
    console.log('💾 Data Source has been initialized successfully.');
    if (env.NODE_ENV === 'development' && dataSourceOptions.synchronize) {
      console.log('🔄 Database synchronized (development mode).');
    }
    return AppDataSource;
  } catch (err) {
    console.error('❌ Error during Data Source initialization:', err);
    throw err;
  }
};
