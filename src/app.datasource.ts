import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres', // データベースの種別。今回はpostgresqlへの接続とします。

  host: 'dpg-csrebbt6l47c73fd8sqg-a',

  username: 'testdb_dgiu_user',

  password: 'lMfYGpW8a0VHRKMHwssPKxcdTls4MgeW',

  database: 'testdb_dgiu',

  entities: ['src/entities/*.ts'], //  エンティティファイル（後述）配列

  migrations: ['src/migrations/*.ts'], // マイグレーションファイル（後述）配列
});

export default AppDataSource;
