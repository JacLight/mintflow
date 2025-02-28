import cron from 'node-cron';

interface Task {
    id: string;
    type: 'cron' | 'interval' | 'timeout';
    expression: string;
    interval?: number;
    timeout?: number;
}

const tasks: Task[] = [];
const intervalIds: { [key: string]: NodeJS.Timeout } = {};

export const scheduleTask = (task: Task) => {
    tasks.push(task);
    switch (task.type) {
        case 'cron':
            cron.schedule(task.expression, () => {
                console.log(`Cron job executed: ${task.id}`);
            });
            break;
        case 'interval':
            const intervalId = setInterval(() => {
                console.log(`Interval executed: ${task.id}`);
            }, task.interval! * 1000);
            intervalIds[task.id] = intervalId;
            break;
        case 'timeout':
            setTimeout(() => {
                console.log(`Timeout executed: ${task.id}`);
            }, task.timeout! * 1000);
            break;
    }
    return task.id;
};

export const getTasks = () => tasks;

export const removeTask = (id: string) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        const task = tasks[index];
        if (task.type === 'interval' && intervalIds[id]) {
            clearInterval(intervalIds[id]);
            delete intervalIds[id];
        }
        tasks.splice(index, 1);
    }
};
