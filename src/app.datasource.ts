import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres', // データベースの種別。今回はpostgresqlへの接続とします。

  host: 'dpg-csrdkqbtq21c73d1pf20-a:5432',

  username: 'testdb_gqw3_user',

  password: '9ODbipFm5Qf6MAoSo73c3vEs3b6S2V7H',

  database: 'testdb_gqw3',

  entities: ['src/entities/*.ts'], //  エンティティファイル（後述）配列

  migrations: ['src/migrations/*.ts'], // マイグレーションファイル（後述）配列
});

export default AppDataSource;
