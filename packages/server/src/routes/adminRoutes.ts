import express, { Router } from 'express';
import {
    // API Keys
    getAllApiKeys,
    getApiKeyById,
    createApiKey,
    updateApiKey,
    deleteApiKey,

    // Profile
    getProfile,
    updateProfile,

    // Members
    getAllMembers,
    getMemberById,
    inviteMember,
    updateMember,
    removeMember,

    // Workspaces
    getAllWorkspaces,
    getWorkspaceById,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,

    // Limits
    getLimits,
    updateLimits,

    // Privacy
    getPrivacySettings,
    updatePrivacySettings
} from './controllers/AdminController.js';

// Import billing controller
import {
    getBillingInfo,
    updateBillingInfo,
    getInvoices,
    getInvoiceById
} from './controllers/AdminBillingController.js';

// Import log controller
import {
    getAllLogs,
    getLogById,
    getFlowLogs,
    exportLogs,
    getRetentionPolicy
} from './controllers/AdminLogsController.js';

const adminRouter: Router = express.Router();

// API Keys routes
adminRouter.get('/api-keys', getAllApiKeys);
adminRouter.get('/api-keys/:keyId', getApiKeyById);
adminRouter.post('/api-keys', createApiKey);
adminRouter.put('/api-keys/:keyId', updateApiKey);
adminRouter.delete('/api-keys/:keyId', deleteApiKey);

// Profile routes
adminRouter.get('/profile', getProfile);
adminRouter.put('/profile', updateProfile);

// Members routes
adminRouter.get('/members', getAllMembers);
adminRouter.get('/members/:memberId', getMemberById);
adminRouter.post('/members/invite', inviteMember);
adminRouter.put('/members/:memberId', updateMember);
adminRouter.delete('/members/:memberId', removeMember);

// Workspaces routes
adminRouter.get('/workspaces', getAllWorkspaces);
adminRouter.get('/workspaces/:workspaceId', getWorkspaceById);
adminRouter.post('/workspaces', createWorkspace);
adminRouter.put('/workspaces/:workspaceId', updateWorkspace);
adminRouter.delete('/workspaces/:workspaceId', deleteWorkspace);

// Billing routes
adminRouter.get('/billing', getBillingInfo);
adminRouter.put('/billing', updateBillingInfo);
adminRouter.get('/billing/invoices', getInvoices);
adminRouter.get('/billing/invoices/:invoiceId', getInvoiceById);

// Limits routes
adminRouter.get('/limits', getLimits);
adminRouter.put('/limits', updateLimits);

// Privacy routes
adminRouter.get('/privacy', getPrivacySettings);
adminRouter.put('/privacy', updatePrivacySettings);

// Logs routes
adminRouter.get('/logs', getAllLogs);
adminRouter.get('/logs/flow', getFlowLogs);
adminRouter.get('/logs/export', exportLogs);
adminRouter.get('/logs/retention', getRetentionPolicy);
adminRouter.get('/logs/:logId', getLogById);

export default adminRouter;
