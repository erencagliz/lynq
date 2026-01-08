import { DataTable } from '@/components/data-table';
import FilterBar from '@/components/filters/filter-bar';
import SearchInput from '@/components/filters/search-input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

interface Workflow {
    id: number;
    name: string;
    trigger_event: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    workflows: {
        data: Workflow[];
        current_page: number;
        last_page: number;
        total: number;
        path: string;
        per_page: number;
    };
    filters: {
        search?: string;
        filter_column?: string;
        filter_operator?: string;
        filter_value?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '#' },
    { title: 'Workflows', href: '/settings/workflows' },
];

export default function Index({ workflows, filters }: Props) {
    const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(
        null,
    );
    const [workflowsToDelete, setWorkflowsToDelete] = useState<Workflow[]>([]);

    const handleDelete = () => {
        if (workflowToDelete) {
            router.delete(`/settings/workflows/${workflowToDelete.id}`, {
                onSuccess: () => setWorkflowToDelete(null),
            });
        } else if (workflowsToDelete.length > 0) {
            workflowsToDelete.forEach((workflow, index) => {
                router.delete(`/settings/workflows/${workflow.id}`, {
                    onFinish: () => {
                        if (index === workflowsToDelete.length - 1) {
                            setWorkflowsToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Workflow>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Workflow Name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="cursor-pointer font-medium text-blue-600 hover:underline">
                        <Link
                            href={`/settings/workflows/${row.original.id}/edit`}
                        >
                            {row.original.name}
                        </Link>
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                        ID: #{row.original.id}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'trigger_event',
            header: 'Trigger Event',
            cell: ({ row }) => {
                const trigger = row.original.trigger_event;
                return (
                    <div className="flex items-center gap-2 font-medium text-neutral-700">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span className="capitalize">
                            {trigger.split('.').join(' ')}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                    className={
                        row.original.is_active
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700 shadow-none hover:bg-emerald-100'
                            : 'shadow-none'
                    }
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created On',
            cell: ({ row }) => (
                <span className="text-sm font-medium text-neutral-600">
                    {format(new Date(row.original.created_at), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="px-4 text-right">Actions</div>,
            cell: ({ row }) => {
                const workflow = row.original;
                return (
                    <div className="px-4 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full p-0 hover:bg-neutral-100"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[180px] rounded-xl border-neutral-200 shadow-xl"
                            >
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                    Workflow Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/settings/workflows/${workflow.id}/edit`}
                                        className="flex cursor-pointer items-center gap-2 px-3 py-2 font-medium"
                                    >
                                        <Pencil className="h-4 w-4 text-neutral-500" />{' '}
                                        Edit Configuration
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        setWorkflowToDelete(workflow)
                                    }
                                    className="flex cursor-pointer items-center gap-2 px-3 py-2 font-medium text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                    Workflow
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workflows" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Workflows</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Name', value: 'name' },
                                { label: 'Trigger', value: 'trigger_event' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/settings/workflows/create">
                                <Plus className="mr-2 h-4 w-4" /> New Workflow
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={workflows.data}
                    meta={{
                        current_page: workflows.current_page,
                        last_page: workflows.last_page,
                        total: workflows.total,
                        path: workflows.path,
                        per_page: workflows.per_page,
                    }}
                    filters={filters}
                    placeholder="Search workflows..."
                    onDelete={(rows) => setWorkflowsToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!workflowToDelete || workflowsToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open &&
                    (setWorkflowToDelete(null), setWorkflowsToDelete([]))
                }
            >
                <AlertDialogContent className="rounded-2xl border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black tracking-tighter text-neutral-900 uppercase">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-neutral-500">
                            {workflowToDelete ? (
                                <span>
                                    This will permanently delete the workflow{' '}
                                    <strong>{workflowToDelete.name}</strong>.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{workflowsToDelete.length}</strong>{' '}
                                    workflows.
                                </span>
                            )}{' '}
                            This action cannot be undone and may affect active
                            automations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl border-2 font-bold">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-xl bg-red-600 font-bold shadow-lg shadow-red-100 transition-all hover:bg-red-700 active:scale-95"
                        >
                            {workflowToDelete
                                ? 'Delete Workflow'
                                : 'Delete Workflows'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
