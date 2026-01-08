import { DataTable } from '@/components/data-table';
import FilterBar from '@/components/filters/filter-bar';
import SearchInput from '@/components/filters/search-input';
import { KanbanBoard, KanbanColumnData } from '@/components/kanban/board';
import { KanbanItem } from '@/components/kanban/item';
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
import { BreadcrumbItem, User } from '@/types';
import { DropResult } from '@hello-pangea/dnd';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowRight,
    Building2,
    Eye,
    LayoutGrid,
    List,
    Mail,
    MoreHorizontal,
    Pencil,
    Phone,
    Plus,
    Trash2,
    UserIcon,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    company?: string;
    email?: string;
    phone?: string;
    status: string;
    source?: string;
    user?: User;
    created_at: string;
    updated_at: string;
    title?: string;
}

interface Props {
    leads: {
        data: Lead[];
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leads', href: '/leads' }];

export default function Index({ leads, filters }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

    const handleConvert = () => {
        if (leadToConvert) {
            router.post(
                `/leads/${leadToConvert.id}/convert`,
                {},
                {
                    onSuccess: () => setLeadToConvert(null),
                },
            );
        }
    };

    const columns: ColumnDef<Lead>[] = [
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
            header: 'Name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/leads/${row.original.id}`}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {row.original.first_name} {row.original.last_name}
                    </Link>
                    <span className="text-xs text-neutral-500">
                        {row.original.title}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'company',
            header: 'Company',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                let color = 'bg-gray-100 text-gray-800';
                if (status === 'New') color = 'bg-blue-100 text-blue-800';
                if (status === 'Contacted')
                    color = 'bg-yellow-100 text-yellow-800';
                if (status === 'Qualified')
                    color = 'bg-green-100 text-green-800';
                if (status === 'Lost') color = 'bg-red-100 text-red-800';
                if (status === 'Converted')
                    color = 'bg-purple-100 text-purple-800';

                return (
                    <Badge variant="outline" className={`${color} border-0`}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact Info',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    {row.original.email && <span>{row.original.email}</span>}
                    {row.original.phone && (
                        <span className="text-xs text-neutral-500">
                            {row.original.phone}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'user.name',
            header: 'Owner',
            cell: ({ row }) =>
                row.original.user ? (
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600">
                            {row.original.user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                        </div>
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const lead = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/leads/${lead.id}`}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/leads/${lead.id}/edit`}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setLeadToConvert(lead)}
                                    className="cursor-pointer text-blue-600 focus:text-blue-600"
                                >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Convert to Deal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
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

    const boardColumns: KanbanColumnData[] = [
        { id: 'New', title: 'New' },
        { id: 'Contacted', title: 'Contacted' },
        { id: 'Qualified', title: 'Qualified' },
        { id: 'Lost', title: 'Lost' },
    ];

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        )
            return;

        const leadId = draggableId;
        const newStatus = destination.droppableId;

        router.post(
            `/leads/${leadId}/update-status`,
            { status: newStatus },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Leads</h1>
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
                                { label: 'First Name', value: 'first_name' },
                                { label: 'Last Name', value: 'last_name' },
                                { label: 'Company', value: 'company' },
                                { label: 'Status', value: 'status' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/leads/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Lead
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={leads.data}
                        meta={{
                            current_page: leads.current_page,
                            last_page: leads.last_page,
                            total: leads.total,
                            path: leads.path,
                            per_page: leads.per_page,
                        }}
                        filters={filters}
                        placeholder="Search leads..."
                        hideToolbar={true}
                    />
                ) : (
                    <KanbanBoard
                        columns={boardColumns}
                        items={leads.data}
                        groupBy={(lead) => lead.status}
                        onDragEnd={onDragEnd}
                        renderItem={(lead) => (
                            <KanbanItem className="flex flex-col gap-2">
                                <Link
                                    href={`/leads/${lead.id}`}
                                    className="group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-neutral-900 transition-colors group-hover:text-blue-600">
                                                {lead.first_name}{' '}
                                                {lead.last_name}
                                            </span>
                                            {lead.company && (
                                                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                                                    <Building2 className="h-3 w-3" />
                                                    {lead.company}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        {lead.email && (
                                            <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                                                <Mail className="h-3 w-3 text-neutral-400" />
                                                <span className="truncate">
                                                    {lead.email}
                                                </span>
                                            </div>
                                        )}
                                        {lead.phone && (
                                            <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                                                <Phone className="h-3 w-3 text-neutral-400" />
                                                <span>{lead.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                                        <div className="flex items-center gap-2">
                                            {lead.user ? (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[9px] font-bold text-blue-700">
                                                    {lead.user.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')}
                                                </div>
                                            ) : (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
                                                    <UserIcon className="h-3 w-3 text-neutral-400" />
                                                </div>
                                            )}
                                            <span className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                                                {format(
                                                    new Date(lead.created_at),
                                                    'MMM d',
                                                )}
                                            </span>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                asChild
                                                onClick={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-neutral-100"
                                                >
                                                    <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-40"
                                            >
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/leads/${lead.id}`}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />{' '}
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setLeadToConvert(lead)
                                                    }
                                                    className="text-blue-600"
                                                >
                                                    <ArrowRight className="mr-2 h-4 w-4" />{' '}
                                                    Convert
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </Link>
                            </KanbanItem>
                        )}
                    />
                )}
            </div>

            <AlertDialog
                open={!!leadToConvert}
                onOpenChange={(open) => !open && setLeadToConvert(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Convert Lead</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new <strong>Contact</strong>,{' '}
                            <strong>Account</strong>, and <strong>Deal</strong>{' '}
                            from this lead. The lead will be marked as
                            converted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConvert}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Convert Lead
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
