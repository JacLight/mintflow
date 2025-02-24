#!/bin/bash

# Create the base plugin directory

# Create all subdirectories
mkdir -p src/types
mkdir -p src/services
mkdir -p src/schemas
mkdir -p src/actions
mkdir -p src/utils

# Create main files
touch src/index.ts
touch src/constants.ts

# Create type files
touch src/types/index.ts
touch src/types/common.ts
touch src/types/sms.ts
touch src/types/voice.ts
touch src/types/config.ts

# Create service files
touch src/services/index.ts
touch src/services/base.ts
touch src/services/sms.ts
touch src/services/voice.ts
touch src/services/config.ts

# Create schema files
touch src/schemas/index.ts
touch src/schemas/sms.ts
touch src/schemas/voice.ts
touch src/schemas/config.ts

# Create action files
touch src/actions/index.ts
touch src/actions/sms.ts
touch src/actions/voice.ts
touch src/actions/config.ts

# Create utility files
touch src/utils/index.ts
touch src/utils/validation.ts
touch src/utils/templates.ts

# Print directory structure
echo "Created plugin structure:"
tree 