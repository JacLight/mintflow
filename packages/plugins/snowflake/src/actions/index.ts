import { executeQuery } from './execute-query.js';
import { listDatabases } from './list-databases.js';
import { listSchemas } from './list-schemas.js';
import { listTables } from './list-tables.js';
import { describeTable } from './describe-table.js';
import { customApiCall } from './custom-api-call.js';

export const actions = [
  executeQuery,
  listDatabases,
  listSchemas,
  listTables,
  describeTable,
  customApiCall,
];

export default actions;
