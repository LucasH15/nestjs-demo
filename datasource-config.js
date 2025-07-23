import { DataSource } from 'typeorm';
const dbConfig = require('./ormconfig');

export default new DataSource(dbConfig);
