// src/console.ts
import readline from 'readline';
import chalk from 'chalk';
import { FlowEngine } from '../engine/FlowEngine.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { FlowService } from '../services/FlowService.js';
import { MetricsService } from '../engine/MetricsService.js';

export function setupServerConsole() {
    // Wrap service initialization in try-catch
    let flowEngine: FlowEngine;
    let db: DatabaseService;
    let flowService: FlowService;

    try {
        flowEngine = FlowEngine.getInstance();
        db = DatabaseService.getInstance();
        flowService = FlowService.getInstance();
    } catch (error) {
        console.error(chalk.red('Error initializing services:'), error);
        return; // Exit setup if critical services can't be initialized
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.cyan('server> ')
    });

    let currentTenant: string | null = null;

    // Wrapper for safe command execution
    async function safeExecuteCommand(action: () => Promise<void>) {
        try {
            await action();
        } catch (error: any) {
            console.error(chalk.red('\nError executing command:'), error?.message || error);
            console.log(chalk.yellow('Server continues running. Type "help" for available commands.\n'));
        } finally {
            rl.prompt();
        }
    }

    // Safe DB operation wrapper
    async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T | null> {
        try {
            return await operation();
        } catch (error: any) {
            console.error(chalk.red('Database operation failed:'), error?.message || error);
            return null;
        }
    }

    // Available commands
    const commands = {
        'help': () => {
            console.log(chalk.yellow('\nAvailable commands:'));
            console.log('  tenant <tenantId> - Set current tenant');
            console.log('  current - Show current tenant');
            console.log('  status - Show server status');
            console.log('  flows - List all flows for current tenant');
            console.log('  flow <flowId> - Show flow details');
            console.log('  start <flowId> - Start a flow');
            console.log('  monitor <flowId> - Monitor a flow in real-time');
            console.log('  exit - Exit the console (server keeps running)\n');
            rl.prompt();
        },

        'tenant': (tenantId) => {
            if (!tenantId) {
                console.log(chalk.red('Error: Tenant ID required'));
            } else {
                currentTenant = tenantId;
                console.log(chalk.green(`\nSwitched to tenant: ${tenantId}\n`));
            }
            rl.prompt();
        },

        'current': () => {
            if (currentTenant) {
                console.log(chalk.yellow(`\nCurrent tenant: ${currentTenant}\n`));
            } else {
                console.log(chalk.yellow('\nNo tenant set. Use "tenant <tenantId>" to set one.\n'));
            }
            rl.prompt();
        },

        'status': async () => {
            await safeExecuteCommand(async () => {
                if (!currentTenant) {
                    throw new Error('No tenant set. Use "tenant <tenantId>" first.');
                }

                const flows = await safeDbOperation(() => flowService.getFlows({ tenantId: currentTenant }));
                if (!flows) return;

                console.log(chalk.yellow('\nServer Status:'));
                console.log(`Tenant: ${currentTenant}`);
                console.log('Active flows:', flows.filter(f => f.status === 'running').length);
                console.log('Total flows:', flows.length);
                console.log('Engine status:', flowEngine ? 'Running' : 'Stopped');

                try {
                    console.log('Metrics:', MetricsService.getInstance().getMetrics());
                } catch (error) {
                    console.log('Metrics: Unavailable');
                }

                console.log();
            });
        },

        'flows': async () => {
            await safeExecuteCommand(async () => {
                if (!currentTenant) {
                    throw new Error('No tenant set. Use "tenant <tenantId>" first.');
                }

                const flows = await safeDbOperation(() => flowService.getFlows({ tenantId: currentTenant }));
                if (!flows) return;

                console.log(chalk.yellow(`\nCurrent Flows (Tenant: ${currentTenant}):`));
                flows.forEach(flow => {
                    const statusColor = getStatusColor(flow.status);
                    console.log(`${flow.flowId}: ${statusColor(flow.status)} (${new Date(flow.updatedAt).toLocaleString()})`);
                });
                console.log();
            });
        },

        'flow': async (flowId) => {
            await safeExecuteCommand(async () => {
                if (!currentTenant) {
                    throw new Error('No tenant set. Use "tenant <tenantId>" first.');
                }
                if (!flowId) {
                    throw new Error('Flow ID required');
                }

                const flow = await safeDbOperation(() => flowService.getFlow(currentTenant!, flowId));
                if (!flow) {
                    throw new Error(`Flow ${flowId} not found`);
                }

                console.log(chalk.yellow(`\nFlow ${flowId} Details (Tenant: ${currentTenant}):`));
                console.log('Status:', getStatusColor(flow.status)(flow.status));
                console.log('Created:', new Date(flow.createdAt).toLocaleString());
                console.log('\nNode States:');
                flow.nodeStates.forEach(node => {
                    console.log(`- ${node.nodeId}: ${getStatusColor(node.status)(node.status)}`);
                });
                console.log();
            });
        },

        'start': async (flowId) => {
            await safeExecuteCommand(async () => {
                if (!currentTenant) {
                    throw new Error('No tenant set. Use "tenant <tenantId>" first.');
                }
                if (!flowId) {
                    throw new Error('Flow ID required');
                }

                await flowEngine.runFlow(currentTenant, flowId);
                console.log(chalk.green(`\nFlow ${flowId} started successfully\n`));
            });
        },

        'monitor': async (flowId) => {
            if (!currentTenant) {
                console.log(chalk.red('\nError: No tenant set. Use "tenant <tenantId>" first.\n'));
                rl.prompt();
                return;
            }

            if (!flowId) {
                console.log(chalk.red('Error: Flow ID required'));
                rl.prompt();
                return;
            }

            console.log(chalk.yellow(`\nMonitoring flow ${flowId} (Tenant: ${currentTenant}) (Ctrl+C to stop)...\n`));

            let intervalId: NodeJS.Timeout | null = null;

            try {
                intervalId = setInterval(async () => {
                    try {
                        const flow = await safeDbOperation(() => flowService.getFlow(currentTenant!, flowId));
                        if (!flow) {
                            console.log(chalk.red(`Flow ${flowId} not found`));
                            if (intervalId) clearInterval(intervalId);
                            rl.prompt();
                            return;
                        }

                        // Clear the last few lines
                        process.stdout.write('\x1b[2J');
                        process.stdout.write('\x1b[0f');

                        console.log(chalk.yellow(`Flow ${flowId} Status (Tenant: ${currentTenant}):`));
                        console.log('Current Status:', getStatusColor(flow.status)(flow.status));
                        console.log('\nNodes:');
                        flow.nodeStates.forEach(node => {
                            const duration = calculateDuration(node.startedAt, node.finishedAt);
                            console.log(`- ${node.nodeId}: ${getStatusColor(node.status)(node.status)} (${duration})`);
                        });

                        if (flow.status === 'completed' || flow.status === 'failed') {
                            if (intervalId) clearInterval(intervalId);
                            console.log(chalk.yellow('\nMonitoring finished\n'));
                            rl.prompt();
                        }
                    } catch (error) {
                        console.error(chalk.red('\nError during monitoring:'), error);
                        if (intervalId) clearInterval(intervalId);
                        rl.prompt();
                    }
                }, 1000);
            } catch (error) {
                console.error(chalk.red('\nError setting up monitoring:'), error);
                if (intervalId) clearInterval(intervalId);
                rl.prompt();
            }

            // Handle Ctrl+C to stop monitoring
            const cleanup = () => {
                if (intervalId) clearInterval(intervalId);
                console.log(chalk.yellow('\nStopped monitoring\n'));
                rl.prompt();
                rl.removeListener('SIGINT', cleanup);
            };
            rl.on('SIGINT', cleanup);
        },

        'exit': () => {
            rl.close();
        }
    };

    // Start the interactive console
    console.log(chalk.green('\nInteractive console started. Type "help" for available commands.\n'));
    rl.prompt();

    // Safe command execution from input
    rl.on('line', async (line) => {
        try {
            const [cmd, ...args] = line.trim().split(' ');

            if (cmd in commands) {
                await commands[cmd](...args);
            } else {
                console.log(chalk.red('Unknown command. Type "help" for available commands.\n'));
                rl.prompt();
            }
        } catch (error) {
            console.error(chalk.red('\nError processing command:'), error);
            console.log(chalk.yellow('Server continues running. Type "help" for available commands.\n'));
            rl.prompt();
        }
    });

    rl.on('close', () => {
        console.log(chalk.yellow('\nConsole closed. Server continues running.\n'));
    });

    // Handle uncaught errors in the console
    process.on('uncaughtException', (error) => {
        console.error(chalk.red('\nUncaught error in console:'), error);
        console.log(chalk.yellow('Server continues running. Type "help" for available commands.\n'));
        rl.prompt();
    });

    process.on('unhandledRejection', (error) => {
        console.error(chalk.red('\nUnhandled promise rejection in console:'), error);
        console.log(chalk.yellow('Server continues running. Type "help" for available commands.\n'));
        rl.prompt();
    });
}

function getStatusColor(status: string) {
    const colors: Record<string, any> = {
        running: chalk.yellow,
        completed: chalk.green,
        failed: chalk.red,
        waiting: chalk.blue,
        manual_wait: chalk.magenta,
        pending: chalk.gray
    };
    return colors[status] || chalk.white;
}

function calculateDuration(start?: Date, end?: Date): string {
    if (!start) return '-';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = endTime - startTime;

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m`;
}