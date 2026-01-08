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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Deal, Pipeline } from '@/types';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from '@hello-pangea/dnd';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Building2,
    Eye,
    LayoutGrid,
    List,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    TrendingUp,
    User,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deals',
        href: '/deals',
    },
];

interface Props {
    deals:
        | {
              data: Deal[];
              current_page: number;
              last_page: number;
              total: number;
              path: string;
              per_page: number;
          }
        | Deal[];
    pipelines: Pipeline[];
    currentPipelineId: number;
    filters: {
        search?: string;
        filter_column?: string;
        filter_operator?: string;
        filter_value?: string;
    };
}

export default function Index({
    deals,
    pipelines,
    currentPipelineId,
    filters,
}: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
    const [dealsToDelete, setDealsToDelete] = useState<Deal[]>([]);
    const currentPipeline =
        pipelines.find((p) => p.id === currentPipelineId) || pipelines[0];

    const handleDelete = () => {
        if (dealToDelete) {
            router.delete(`/deals/${dealToDelete.id}`, {
                onSuccess: () => setDealToDelete(null),
            });
        } else if (dealsToDelete.length > 0) {
            dealsToDelete.forEach((deal, index) => {
                router.delete(`/deals/${deal.id}`, {
                    onFinish: () => {
                        if (index === dealsToDelete.length - 1) {
                            setDealsToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const dealId = draggableId;
        const newStageId = destination.droppableId;

        router.patch(
            `/deals/${dealId}/update-stage`,
            {
                pipeline_stage_id: newStageId,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const columns: ColumnDef<Deal>[] = [
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
            header: 'Deal Name',
            cell: ({ row }) => {
                const deal = row.original;
                return (
                    <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {deal.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'entity',
            header: 'Account/Contact',
            cell: ({ row }) => {
                const deal = row.original;
                return (
                    <div className="flex flex-col text-sm">
                        {deal.account ? (
                            <span className="flex items-center gap-1 text-neutral-600">
                                <Building2 className="h-3 w-3" />
                                {deal.account.name}
                            </span>
                        ) : (
                            '-'
                        )}
                        {deal.contact && (
                            <span className="flex items-center gap-1 text-xs text-neutral-400">
                                <User className="h-3 w-3" />
                                {deal.contact.first_name}{' '}
                                {deal.contact.last_name}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'value',
            header: 'Value',
            cell: ({ row }) => {
                const deal = row.original;
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: deal.currency,
                }).format(deal.value);
            },
        },
        {
            accessorKey: 'stage',
            header: 'Stage',
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
                    {row.original.stage?.name}
                </span>
            ),
        },
        {
            accessorKey: 'expected_close_date',
            header: 'Expected Close',
            cell: ({ row }) => {
                const date = row.getValue('expected_close_date') as string;
                return date ? new Date(date).toLocaleDateString() : '-';
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const deal = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
                            >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/deals/${deal.id}`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/deals/${deal.id}/edit`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setDealToDelete(deal)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
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
            <Head title="Deals" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-neutral-500" />
                            <h1 className="text-2xl font-semibold">Deals</h1>
                        </div>

                        {pipelines.length > 0 && (
                            <Select
                                value={currentPipelineId?.toString() || ''}
                                onValueChange={(val) =>
                                    (window.location.href = `/deals?pipeline_id=${val}`)
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select Pipeline" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pipelines.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={p.id.toString()}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-md border bg-neutral-100 p-1">
                            <Button
                                variant={
                                    viewMode === 'board' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => setViewMode('board')}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Board
                            </Button>
                            <Button
                                variant={
                                    viewMode === 'list' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="mr-2 h-4 w-4" />
                                List
                            </Button>
                        </div>
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Name', value: 'name' },
                                {
                                    label: 'Value',
                                    value: 'value',
                                    type: 'number',
                                },
                                {
                                    label: 'Expected Close Date',
                                    value: 'expected_close_date',
                                },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/deals/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Deal
                            </Link>
                        </Button>
                    </div>
                </div>

                {pipelines.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border bg-white shadow-sm">
                        <TrendingUp className="h-12 w-12 text-neutral-300" />
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-neutral-900">
                                No pipelines defined
                            </h3>
                            <p className="text-sm text-neutral-500">
                                Create your first sales pipeline to start
                                managing deals.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/pipelines/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Pipeline
                            </Link>
                        </Button>
                    </div>
                ) : viewMode === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={Array.isArray(deals) ? deals : deals.data}
                        meta={
                            !Array.isArray(deals)
                                ? {
                                      current_page: deals.current_page,
                                      last_page: deals.last_page,
                                      total: deals.total,
                                      path: deals.path,
                                      per_page: deals.per_page,
                                  }
                                : undefined
                        }
                        filters={filters}
                        placeholder="Search deals..."
                        onDelete={(rows) => setDealsToDelete(rows)}
                        hideToolbar={true}
                    />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex-1 overflow-x-auto pb-4">
                            <div className="flex h-full min-w-max gap-4">
                                {currentPipeline?.stages.map((stage) => {
                                    const stageDeals = (
                                        Array.isArray(deals)
                                            ? deals
                                            : deals.data
                                    ).filter(
                                        (d) => d.pipeline_stage_id === stage.id,
                                    );
                                    const totalValue = stageDeals.reduce(
                                        (sum, d) => sum + Number(d.value),
                                        0,
                                    );

                                    return (
                                        <div
                                            key={stage.id}
                                            className="flex w-72 flex-col rounded-lg border bg-neutral-100 p-3"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="truncate text-sm font-semibold">
                                                    {stage.name}
                                                </h3>
                                                <span className="text-xs text-neutral-500">
                                                    {stageDeals.length}
                                                </span>
                                            </div>
                                            <div className="mb-4 text-xs font-medium text-neutral-400">
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    },
                                                ).format(totalValue)}
                                            </div>

                                            <Droppable
                                                droppableId={stage.id.toString()}
                                            >
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="min-h-[200px] flex-1 space-y-3 overflow-y-auto"
                                                    >
                                                        {stageDeals.map(
                                                            (deal, index) => (
                                                                <Draggable
                                                                    key={
                                                                        deal.id
                                                                    }
                                                                    draggableId={deal.id.toString()}
                                                                    index={
                                                                        index
                                                                    }
                                                                >
                                                                    {(
                                                                        provided,
                                                                    ) => (
                                                                        <div
                                                                            ref={
                                                                                provided.innerRef
                                                                            }
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                        >
                                                                            <Link
                                                                                href={`/deals/${deal.id}`}
                                                                                className="group block rounded border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                                                                            >
                                                                                <div className="mb-2 truncate text-sm font-medium group-hover:text-blue-600">
                                                                                    {
                                                                                        deal.name
                                                                                    }
                                                                                </div>
                                                                                <div className="mb-2 truncate text-xs text-neutral-500">
                                                                                    {deal
                                                                                        .account
                                                                                        ?.name ||
                                                                                        deal
                                                                                            .contact
                                                                                            ?.first_name ||
                                                                                        'No Entity'}
                                                                                </div>
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-xs font-semibold">
                                                                                        {new Intl.NumberFormat(
                                                                                            'en-US',
                                                                                            {
                                                                                                style: 'currency',
                                                                                                currency:
                                                                                                    deal.currency,
                                                                                            },
                                                                                        ).format(
                                                                                            deal.value,
                                                                                        )}
                                                                                    </span>
                                                                                    {deal.expected_close_date && (
                                                                                        <span className="text-[10px] text-neutral-400">
                                                                                            {new Date(
                                                                                                deal.expected_close_date,
                                                                                            ).toLocaleDateString()}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ),
                                                        )}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </DragDropContext>
                )}
            </div>

            <AlertDialog
                open={!!dealToDelete || dealsToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setDealToDelete(null), setDealsToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dealToDelete ? (
                                <span>
                                    This will permanently delete the deal{' '}
                                    <strong>{dealToDelete.name}</strong>.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{dealsToDelete.length}</strong>{' '}
                                    deals.
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
                            {dealToDelete ? 'Delete Deal' : 'Delete Deals'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
