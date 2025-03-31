import { ApiKey } from '@/lib/admin-service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CopyIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApiKeysListProps {
    apiKeys: ApiKey[];
}

export function ApiKeysList({ apiKeys }: ApiKeysListProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {apiKeys.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No API keys found. Create one to get started.
                        </TableCell>
                    </TableRow>
                ) : (
                    apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.apiKeyId}>
                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                    {apiKey.environment}
                                </span>
                            </TableCell>
                            <TableCell>{apiKey.workspace}</TableCell>
                            <TableCell>
                                {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                {apiKey.lastUsed
                                    ? formatDistanceToNow(new Date(apiKey.lastUsed), { addSuffix: true })
                                    : 'Never'}
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        icon={<CopyIcon className="h-4 w-4" />}
                                        title="Copy API Key ID"
                                        onClick={() => {
                                            navigator.clipboard.writeText(apiKey.apiKeyId);
                                        }}
                                    />
                                    <Button
                                        icon={<TrashIcon className="h-4 w-4" />}
                                        title="Delete API Key"
                                        className="text-red-500"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this API key?')) {
                                                // Delete API key
                                                console.log('Delete API key', apiKey.apiKeyId);
                                            }
                                        }}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
