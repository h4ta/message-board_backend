import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres', // データベースの種別。今回はpostgresqlへの接続とします。

  host: 'dpg-csrdkqbtq21c73d1pf20-a',

  username: 'postgres',

  password: 'postgres',

  database: 'testdb',

  entities: ['src/entities/*.ts'], //  エンティティファイル（後述）配列

  migrations: ['src/migrations/*.ts'], // マイグレーションファイル（後述）配列
});

export default AppDataSource;
