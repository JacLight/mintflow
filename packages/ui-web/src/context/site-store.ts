import { getRandomString } from '@/lib-client/helpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the types for our state
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

// Create the user store with persistence
export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user: User) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'user-storage', // unique name for localStorage
        }
    )
);

// Company state
interface CompanyState {
    company: Company | null;
    setCompany: (company: Company) => void;
    clearCompany: () => void;
}

interface Company {
    id: string;
    name: string;
    legalName: string;
    taxId: string;
    industry: string;
    // Add more fields as needed
}

export const useCompanyStore = create<CompanyState>((set) => ({
    company: null,
    setCompany: (company: Company) => set({ company }),
    clearCompany: () => set({ company: null }),
}));

// UI state for global UI state management
interface UIState {
    sidebarOpen: boolean;
    theme: any;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: any) => void;
    isLoading: boolean;
    error?: string | null;
    setStateItem: (items: { [key: string]: any }) => void;
    getStateItem: (key: string) => any;
    quickViewProps: { id?: string, type?: string, data?: any, schema?: any, rules?: any };
    showNotice: (message: string, type: string) => void;
    notifications?: { id: string; title: string; message: string; type: string; status: string }[];
    componentTypes?: any[];
    componentGroups?: any[];
    getNodeInfo: (id: string) => any;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            theme: 'system',
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
            setTheme: (theme) => set({ theme }),
            isLoading: false,
            getStateItem: (key: string) => key,
            setStateItem: (items: { [key: string]: any }) => set((state: any) => ({ ...items })),
            quickViewProps: {},
            showNotice: (message: string, type: string) => {
                if (typeof message !== 'string') return;
                const notification = { id: getRandomString(6), title: '', message, type, status: 'new' };
                set({ notifications: [...(get().notifications || []), notification] });
            },
            getNodeInfo: (nodeId: string) => {
                const componentTypes = get().componentTypes || [];
                return componentTypes.find((c: any) => c.id.toLowerCase() === nodeId?.toLowerCase());
            }
        }),
        {
            name: 'ui-storage', // unique name for localStorage
        }
    )
);

// Payroll state
interface PayrollState {
    currentPayrollRun: PayrollRun | null;
    payrollHistory: PayrollRun[];
    startPayrollRun: (payrollRun: PayrollRun) => void;
    updatePayrollRun: (payrollRun: PayrollRun) => void;
    completePayrollRun: (payrollRun: PayrollRun) => void;
    clearCurrentPayrollRun: () => void;
}

interface PayrollRun {
    id: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: 'draft' | 'in-progress' | 'review' | 'approved' | 'completed';
    // Add more fields as needed
}

export const usePayrollStore = create<PayrollState>((set) => ({
    currentPayrollRun: null,
    payrollHistory: [],
    startPayrollRun: (payrollRun: PayrollRun) => set({ currentPayrollRun: payrollRun }),
    updatePayrollRun: (payrollRun: PayrollRun) =>
        set((state) => ({
            currentPayrollRun: payrollRun,
            payrollHistory: state.payrollHistory.map(run =>
                run.id === payrollRun.id ? payrollRun : run
            )
        })),
    completePayrollRun: (payrollRun: PayrollRun) =>
        set((state) => ({
            currentPayrollRun: null,
            payrollHistory: [...state.payrollHistory, { ...payrollRun, status: 'completed' }]
        })),
    clearCurrentPayrollRun: () => set({ currentPayrollRun: null }),
}));

// Tax filing state
interface TaxFilingState {
    currentFiling: TaxFiling | null;
    filingHistory: TaxFiling[];
    startFiling: (filing: TaxFiling) => void;
    updateFiling: (filing: TaxFiling) => void;
    completeFiling: (filing: TaxFiling) => void;
    clearCurrentFiling: () => void;
}

interface TaxFiling {
    id: string;
    type: 'individual' | 'business';
    taxYear: number;
    status: 'draft' | 'in-progress' | 'review' | 'submitted' | 'accepted' | 'rejected';
    // Add more fields as needed
}

export const useTaxFilingStore = create<TaxFilingState>((set) => ({
    currentFiling: null,
    filingHistory: [],
    startFiling: (filing: TaxFiling) => set({ currentFiling: filing }),
    updateFiling: (filing: TaxFiling) =>
        set((state) => ({
            currentFiling: filing,
            filingHistory: state.filingHistory.map(f =>
                f.id === filing.id ? filing : f
            )
        })),
    completeFiling: (filing: TaxFiling) =>
        set((state) => ({
            currentFiling: null,
            filingHistory: [...state.filingHistory, { ...filing, status: 'submitted' }]
        })),
    clearCurrentFiling: () => set({ currentFiling: null }),
}));

// Root store that combines all stores for easier access
export const useSiteStore = () => ({
    user: useUserStore,
    company: useCompanyStore,
    ui: useUIStore,
    payroll: usePayrollStore,
    taxFiling: useTaxFilingStore,
});
