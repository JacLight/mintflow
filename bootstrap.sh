#!/usr/bin/env bash

################################################################################
# 1. CREATE FOLDER STRUCTURE & BLANK FILES
################################################################################

mkdir -p my-complete-phd-project
cd my-complete-phd-project || exit 1

mkdir -p server/src/{config,interfaces,providers/{database,vectorDb},queues,runners,routes,ui,utils}
mkdir -p python_runner

# Shell script only touches blank files - no code lumps here.

# Server side
touch server/package.json
touch server/tsconfig.json
touch server/Dockerfile
touch server/.env.example

touch server/src/config/env.ts
touch server/src/utils/logger.ts
touch server/src/interfaces/IDatabaseProvider.ts
touch server/src/interfaces/IVectorDbProvider.ts

touch server/src/providers/database/mongoProvider.ts
touch server/src/providers/database/postgresProvider.ts
touch server/src/providers/vectorDb/weaviateProvider.ts
touch server/src/providers/vectorDb/pineconeProvider.ts

touch server/src/providerFactory.ts

touch server/src/queues/queueManager.ts
touch server/src/queues/tenantQueue.ts

touch server/src/runners/nodeRunner.ts
touch server/src/runners/index.ts

touch server/src/routes/flowRoutes.ts
touch server/src/routes/vectorRoutes.ts
touch server/src/routes/uiRoutes.ts

touch server/src/ui/flowDesigner.ts

touch server/src/demoNodes.ts
touch server/src/app.ts
touch server/src/index.ts

# Python runner
touch python_runner/app.py
touch python_runner/requirements.txt
touch python_runner/Dockerfile

echo "Blank file structure created. Now fill each file with robust code as needed."
