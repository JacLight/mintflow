
export interface IDatabaseProvider {
    connect(): Promise<void>;
    createTenant(tenantId: string): Promise<void>;
}