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
import { BreadcrumbItem, Pipeline } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    ChevronRight,
    GitBranch,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Pipelines',
        href: '/pipelines',
    },
];

interface Props {
    pipelines: {
        data: Pipeline[];
        current_page: number;
        last_page: number;
        total: number;
        path: string;
        per_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ pipelines, filters }: Props) {
    const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(
        null,
    );
    const [pipelinesToDelete, setPipelinesToDelete] = useState<Pipeline[]>([]);

    const handleDelete = () => {
        if (pipelineToDelete) {
            router.delete(`/pipelines/${pipelineToDelete.id}`, {
                onSuccess: () => setPipelineToDelete(null),
            });
        } else if (pipelinesToDelete.length > 0) {
            pipelinesToDelete.forEach((pipeline, index) => {
                if (!pipeline.is_default) {
                    router.delete(`/pipelines/${pipeline.id}`, {
                        onFinish: () => {
                            if (index === pipelinesToDelete.length - 1) {
                                setPipelinesToDelete([]);
                            }
                        },
                        preserveScroll: true,
                    });
                }
            });
        }
    };

    const columns: ColumnDef<Pipeline>[] = [
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
                    disabled={row.original.is_default}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-blue-600">
                        <Link href={`/pipelines/${row.original.id}/edit`}>
                            {row.getValue('name')}
                        </Link>
                    </span>
                    <span className="text-xs text-neutral-500">
                        Created{' '}
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'stages',
            header: 'Stages',
            cell: ({ row }) => (
                <div className="flex max-w-[400px] items-center gap-1 overflow-x-auto">
                    {row.original.stages.map((stage, idx) => (
                        <div
                            key={stage.id}
                            className="flex shrink-0 items-center"
                        >
                            <div className="rounded bg-neutral-100 px-2 py-1 text-xs">
                                {stage.name}
                            </div>
                            {idx < row.original.stages.length - 1 && (
                                <ChevronRight className="mx-0.5 h-3 w-3 text-neutral-400" />
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'is_default',
            header: 'Default',
            cell: ({ row }) =>
                row.getValue('is_default') ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                        Default
                    </span>
                ) : (
                    '-'
                ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/pipelines/${row.original.id}/edit`}
                                    className="flex cursor-pointer items-center"
                                >
                                    <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                    Edit Pipeline
                                </Link>
                            </DropdownMenuItem>
                            {!row.original.is_default && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.patch(
                                                `/pipelines/${row.original.id}/make-default`,
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <GitBranch className="mr-2 h-4 w-4 text-neutral-500" />
                                        Make Default
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                        onClick={() =>
                                            setPipelineToDelete(row.original)
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Pipeline
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Pipelines" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Pipelines
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[{ label: 'Name', value: 'name' }]}
                        />
                        <Button asChild>
                            <Link href="/pipelines/create">
                                <Plus className="mr-2 h-4 w-4" /> New Pipeline
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={pipelines.data}
                    meta={{
                        current_page: pipelines.current_page,
                        last_page: pipelines.last_page,
                        total: pipelines.total,
                        path: pipelines.path,
                        per_page: pipelines.per_page,
                    }}
                    filters={filters}
                    placeholder="Search pipelines..."
                    onDelete={(rows) => setPipelinesToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!pipelineToDelete || pipelinesToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open &&
                    (setPipelineToDelete(null), setPipelinesToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pipelineToDelete ? (
                                <span>
                                    This will permanently delete the pipeline{' '}
                                    <strong>{pipelineToDelete.name}</strong>.
                                    Deals associated with this pipeline might be
                                    affected.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{pipelinesToDelete.length}</strong>{' '}
                                    pipelines. Deals associated with these
                                    pipelines might be affected.
                                </span>
                            )}{' '}
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {pipelineToDelete
                                ? 'Delete Pipeline'
                                : 'Delete Pipelines'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
