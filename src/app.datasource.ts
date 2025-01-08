import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres', // データベースの種別。今回はpostgresqlへの接続とします。

  host: process.env.DB_HOST,

  port: Number(process.env.DB_PORT),

  username: process.env.DB_USER,

  password: process.env.DB_PASS,

  database: process.env.DB_NAME,

  entities: ['src/entities/*.ts'], //  エンティティファイル（後述）配列

  migrations: ['src/migrations/*.ts'], // マイグレーションファイル（後述）配列
});

export default AppDataSource;
