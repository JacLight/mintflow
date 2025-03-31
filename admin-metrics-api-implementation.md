# MintFlow Admin & Metrics API Implementation Documentation

## Overview

This document outlines the implementation plan for the Admin and Metrics APIs needed to support the new UI screens in the MintFlow application. It serves as a tracking document for implementation progress.

## Current State

- **Admin API (`/admin`)**: Routes defined but using mock data in controllers
- **Metrics API (`/metrics`)**: Routes defined but using mock data in controllers
- **Flow Runs API**: Implemented with database integration
- **Logs API**: Implemented with database integration

## Implementation Requirements

### 1. Database Models

| Model | Description | Status |
|-------|-------------|--------|
| ApiKey | API key management | Completed |
| UsageMetrics | Usage statistics | Completed |
| CostMetrics | Cost tracking | Not Started |
| Profile | User profile information | Not Started |
| Member | Team member management | Not Started |
| Workspace | Workspace management | Not Started |
| Billing | Billing information | Not Started |
| Invoice | Invoice records | Not Started |
| Limits | Account limits | Not Started |
| Privacy | Privacy settings | Not Started |

### 2. Model Implementations

For each model, the following files need to be created:

#### 2.1 Schema Definitions

| File | Status |
|------|--------|
| `packages/server/src/models/schemas/ApiKeySchema.ts` | Completed |
| `packages/server/src/models/schemas/UsageMetricsSchema.ts` | Completed |
| `packages/server/src/models/schemas/CostMetricsSchema.ts` | Not Started |
| `packages/server/src/models/schemas/ProfileSchema.ts` | Not Started |
| `packages/server/src/models/schemas/MemberSchema.ts` | Not Started |
| `packages/server/src/models/schemas/WorkspaceSchema.ts` | Not Started |
| `packages/server/src/models/schemas/BillingSchema.ts` | Not Started |
| `packages/server/src/models/schemas/InvoiceSchema.ts` | Not Started |
| `packages/server/src/models/schemas/LimitsSchema.ts` | Not Started |
| `packages/server/src/models/schemas/PrivacySchema.ts` | Not Started |

#### 2.2 Validators

| File | Status |
|------|--------|
| `packages/server/src/models/validators/ApiKeyValidator.ts` | Completed |
| `packages/server/src/models/validators/UsageMetricsValidator.ts` | Completed |
| `packages/server/src/models/validators/CostMetricsValidator.ts` | Not Started |
| `packages/server/src/models/validators/ProfileValidator.ts` | Not Started |
| `packages/server/src/models/validators/MemberValidator.ts` | Not Started |
| `packages/server/src/models/validators/WorkspaceValidator.ts` | Not Started |
| `packages/server/src/models/validators/BillingValidator.ts` | Not Started |
| `packages/server/src/models/validators/InvoiceValidator.ts` | Not Started |
| `packages/server/src/models/validators/LimitsValidator.ts` | Not Started |
| `packages/server/src/models/validators/PrivacyValidator.ts` | Not Started |

#### 2.3 MongoDB Models

| File | Status |
|------|--------|
| `packages/server/src/models/mongo-models/ApiKey.ts` | Completed |
| `packages/server/src/models/mongo-models/UsageMetrics.ts` | Completed |
| `packages/server/src/models/mongo-models/CostMetrics.ts` | Not Started |
| `packages/server/src/models/mongo-models/Profile.ts` | Not Started |
| `packages/server/src/models/mongo-models/Member.ts` | Not Started |
| `packages/server/src/models/mongo-models/Workspace.ts` | Not Started |
| `packages/server/src/models/mongo-models/Billing.ts` | Not Started |
| `packages/server/src/models/mongo-models/Invoice.ts` | Not Started |
| `packages/server/src/models/mongo-models/Limits.ts` | Not Started |
| `packages/server/src/models/mongo-models/Privacy.ts` | Not Started |

#### 2.4 PostgreSQL Models

| File | Status |
|------|--------|
| `packages/server/src/models/postgres-models/ApiKey.ts` | Completed |
| `packages/server/src/models/postgres-models/UsageMetrics.ts` | Completed |
| `packages/server/src/models/postgres-models/CostMetrics.ts` | Not Started |
| `packages/server/src/models/postgres-models/Profile.ts` | Not Started |
| `packages/server/src/models/postgres-models/Member.ts` | Not Started |
| `packages/server/src/models/postgres-models/Workspace.ts` | Not Started |
| `packages/server/src/models/postgres-models/Billing.ts` | Not Started |
| `packages/server/src/models/postgres-models/Invoice.ts` | Not Started |
| `packages/server/src/models/postgres-models/Limits.ts` | Not Started |
| `packages/server/src/models/postgres-models/Privacy.ts` | Not Started |

### 3. Service Implementations

| Service | Description | Status |
|---------|-------------|--------|
| AdminService | Handles API Keys, Profile, Members, Workspaces, Billing, Limits, Privacy | Partially Completed |
| MetricsService | Handles Usage and Cost metrics | Partially Completed |

#### 3.1 Service Files

| File | Status |
|------|--------|
| `packages/server/src/services/AdminService.ts` | Completed (API Keys functionality) |
| `packages/server/src/services/MetricsService.ts` | Completed (Usage metrics functionality) |

### 4. Controller Updates

| Controller | Description | Status |
|------------|-------------|--------|
| AdminController | Replace mock data with AdminService calls | Partially Completed |
| MetricsController | Replace mock data with MetricsService calls | Partially Completed |

## Model Specifications

### 1. ApiKey Model

```typescript
{
  apiKeyId: string; // Primary key with UUID
  name: string;
  prefix: string;
  fullKey: string; // Stored securely, only returned on creation
  created: Date;
  workspace: string;
  environment: string; // 'Production' or 'Development'
  lastUsed: Date;
  tenantId: string; // Foreign key to Tenant
}
```

### 2. UsageMetrics Model

```typescript
{
  usageId: string; // Primary key with UUID
  tenantId: string; // Foreign key to Tenant
  totalRequests: number;
  totalTokens: number;
  requestsByModel: object; // JSON object with model names as keys
  tokensByModel: object; // JSON object with model names as keys
  period: string; // 'daily', 'weekly', 'monthly'
  date: Date; // For time-based queries
}
```

### 3. CostMetrics Model

```typescript
{
  costId: string; // Primary key with UUID
  tenantId: string; // Foreign key to Tenant
  totalCost: number;
  costByModel: object; // JSON object with model names as keys
  costByWorkspace: object; // JSON object with workspace names as keys
  period: string; // 'daily', 'weekly', 'monthly'
  date: Date; // For time-based queries
}
```

### 4. Profile Model

```typescript
{
  profileId: string; // Primary key with UUID
  userId: string; // Foreign key to User
  name: string;
  email: string;
  avatar: string;
  role: string;
  preferences: object; // JSON object for user preferences
}
```

### 5. Member Model

```typescript
{
  memberId: string; // Primary key with UUID
  name: string;
  email: string;
  role: string; // 'Admin', 'Editor', etc.
  status: string; // 'Active', 'Pending', etc.
  joinedAt: Date;
  workspaces: string[]; // Array of workspace IDs
  tenantId: string; // Foreign key to Tenant
}
```

### 6. Workspace Model

```typescript
{
  workspaceId: string; // Primary key with UUID
  name: string;
  description: string;
  createdAt: Date;
  members: object[]; // Array of member objects with IDs and roles
  tenantId: string; // Foreign key to Tenant
}
```

### 7. Billing Model

```typescript
{
  billingId: string; // Primary key with UUID
  tenantId: string; // Foreign key to Tenant
  plan: string; // 'Free', 'Pro', etc.
  status: string; // 'Active', 'Inactive', etc.
  nextBillingDate: Date;
  paymentMethod: object; // Payment method details
  billingAddress: object; // Billing address details
}
```

### 8. Invoice Model

```typescript
{
  invoiceId: string; // Primary key with UUID
  billingId: string; // Foreign key to Billing
  amount: number;
  status: string; // 'Paid', 'Pending', etc.
  date: Date;
  items: object[]; // Line items
  pdf: string; // URL to PDF
}
```

### 9. Limits Model

```typescript
{
  limitsId: string; // Primary key with UUID
  tenantId: string; // Foreign key to Tenant
  apiRateLimit: number;
  maxWorkspaces: number;
  maxMembers: number;
  maxStorage: number;
  currentUsage: object; // Current usage metrics
}
```

### 10. Privacy Model

```typescript
{
  privacyId: string; // Primary key with UUID
  tenantId: string; // Foreign key to Tenant
  dataRetention: object; // Data retention settings
  dataSharingConsent: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
}
```

## Implementation Steps

1. **Create Schema Definitions**
   - Define MongoDB and PostgreSQL compatible schemas
   - Follow existing patterns in the project

2. **Create Validators**
   - Define Joi validation schemas for each model
   - Include validation for required fields and data types

3. **Create MongoDB Models**
   - Implement models using Mongoose
   - Follow existing patterns in the project

4. **Create PostgreSQL Models**
   - Implement models using Sequelize
   - Follow existing patterns in the project

5. **Implement Services**
   - Create AdminService with methods for all admin operations
   - Create MetricsService with methods for usage and cost metrics
   - Use the DatabaseService for database operations

6. **Update Controllers**
   - Replace mock data in AdminController with AdminService calls
   - Replace mock data in MetricsController with MetricsService calls

7. **Test API Endpoints**
   - Test all endpoints with Postman or similar tool
   - Verify data is correctly stored and retrieved

## Progress Tracking

### Phase 1: Model Implementation

- [x] ApiKey Model
- [x] UsageMetrics Model
- [ ] CostMetrics Model
- [ ] Profile Model
- [ ] Member Model
- [ ] Workspace Model
- [ ] Billing Model
- [ ] Invoice Model
- [ ] Limits Model
- [ ] Privacy Model

### Phase 2: Service Implementation

- [x] AdminService (API Keys functionality)
- [ ] AdminService (remaining functionality)
- [x] MetricsService (Usage metrics functionality)
- [ ] MetricsService (Cost metrics functionality)

### Phase 3: Controller Updates

- [x] AdminController (API Keys functionality)
- [ ] AdminController (remaining functionality)
- [x] MetricsController (Usage metrics functionality)
- [ ] MetricsController (Cost metrics functionality)

### Phase 4: Testing

- [x] API Keys Endpoints (Sequential Test Collection)
- [x] Usage Metrics Endpoints (Sequential Test Collection)
- [ ] Profile Endpoints
- [ ] Members Endpoints
- [ ] Workspaces Endpoints
- [ ] Billing Endpoints
- [ ] Limits Endpoints
- [ ] Privacy Endpoints
- [ ] Cost Metrics Endpoints

## API Testing

Postman collections have been created to test the API endpoints. These collections include requests for all the Admin and Metrics API endpoints.

### Testing Files

- `mintflow-api-tests.postman_collection.json`: Postman collection with all API requests
- `mintflow-api-sequential-tests.postman_collection.json`: Postman collection with tests designed to run in sequence
- `mintflow-api-environment.postman_environment.json`: Postman environment with variables
- `api-testing-readme.md`: Detailed instructions on how to use the Postman collections

### Standard Collection

The standard collection contains all API endpoints organized by category. This collection is useful for testing individual endpoints manually.

### Sequential Test Collection

The sequential test collection is designed to be run in order, with each test depending on the results of previous tests. This collection:

1. Creates a test tenant with a unique identifier
2. Creates, retrieves, updates, and verifies API keys
3. Creates and retrieves usage metrics
4. Cleans up all test data created during the test run

Each test automatically saves necessary IDs to environment variables for subsequent requests and includes test scripts to verify the response. All test data uses identifiers with "TEST_" prefix for easy identification.

### How to Use

1. Import the collections and environment into Postman
2. Configure the environment variables (baseUrl, etc.)
3. Use the standard collection to test individual endpoints
4. Use the sequential collection to run automated tests in sequence

See the `api-testing-readme.md` file for detailed instructions.
