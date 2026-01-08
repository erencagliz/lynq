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
import { UserInfo } from '@/components/user-info';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    AlertCircle,
    Clock,
    LifeBuoy,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    assignee?: User;
    account?: { name: string };
}

interface Props {
    tickets: {
        data: Ticket[];
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
    { title: 'Support', href: '#' },
    { title: 'Tickets', href: '/tickets' },
];

export default function Index({ tickets, filters }: Props) {
    const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
    const [ticketsToDelete, setTicketsToDelete] = useState<Ticket[]>([]);

    const handleDelete = () => {
        if (ticketToDelete) {
            router.delete(`/tickets/${ticketToDelete.id}`, {
                onSuccess: () => setTicketToDelete(null),
            });
        } else if (ticketsToDelete.length > 0) {
            ticketsToDelete.forEach((ticket, index) => {
                router.delete(`/tickets/${ticket.id}`, {
                    onFinish: () => {
                        if (index === ticketsToDelete.length - 1) {
                            setTicketsToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Ticket>[] = [
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
            accessorKey: 'ticket_number',
            header: 'ID',
            cell: ({ row }) => (
                <span className="text-xs font-bold text-neutral-500">
                    #{row.original.ticket_number}
                </span>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <div className="flex max-w-[300px] flex-col">
                    <span className="line-clamp-1 font-bold text-neutral-900">
                        {row.original.subject}
                    </span>
                    {row.original.account && (
                        <span className="text-[10px] font-medium text-neutral-500">
                            {row.original.account.name}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => {
                const priority = row.original.priority;
                let color = 'text-neutral-400';
                let Icon = Clock;

                if (priority === 'Urgent') {
                    color = 'text-rose-600 font-black';
                    Icon = AlertCircle;
                }
                if (priority === 'High') {
                    color = 'text-orange-600 font-bold';
                    Icon = AlertCircle;
                }
                if (priority === 'Medium') {
                    color = 'text-blue-600 font-medium';
                    Icon = Clock;
                }

                return (
                    <div
                        className={`flex items-center gap-1.5 text-xs ${color}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {priority}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                let className = '';

                if (status === 'Open')
                    className = 'bg-blue-100/50 text-blue-700 border-blue-200';
                if (status === 'In Progress')
                    className =
                        'bg-amber-100/50 text-amber-700 border-amber-200';
                if (status === 'Resolved')
                    className =
                        'bg-emerald-100/50 text-emerald-700 border-emerald-200';
                if (status === 'Closed')
                    className =
                        'bg-neutral-100 text-neutral-500 border-neutral-200';

                return (
                    <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wider uppercase ${className}`}
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'assignee',
            header: 'Assignee',
            cell: ({ row }) => {
                const assignee = row.original.assignee;
                return assignee ? (
                    <UserInfo user={assignee} className="h-6 w-6" />
                ) : (
                    <span className="text-xs text-neutral-400 italic">
                        Unassigned
                    </span>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Opened',
            cell: ({ row }) => (
                <span className="text-xs font-medium text-neutral-400">
                    {format(new Date(row.original.created_at), 'MMM d')}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const ticket = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Ticket Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/tickets/${ticket.id}/edit`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setTicketToDelete(ticket)}
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
            <Head title="Tickets" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LifeBuoy className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Tickets</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Number', value: 'ticket_number' },
                                { label: 'Subject', value: 'subject' },
                                { label: 'Status', value: 'status' },
                                { label: 'Priority', value: 'priority' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/tickets/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={tickets.data}
                    meta={{
                        current_page: tickets.current_page,
                        last_page: tickets.last_page,
                        total: tickets.total,
                        path: tickets.path,
                        per_page: tickets.per_page,
                    }}
                    filters={filters}
                    placeholder="Search tickets..."
                    onDelete={(rows) => setTicketsToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!ticketToDelete || ticketsToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setTicketToDelete(null), setTicketsToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {ticketToDelete ? (
                                <span>
                                    This will permanently delete the ticket{' '}
                                    <strong>
                                        #{ticketToDelete.ticket_number}
                                    </strong>{' '}
                                    and all related data.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{ticketsToDelete.length}</strong>{' '}
                                    tickets and all their related data.
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
                            {ticketToDelete
                                ? 'Delete Ticket'
                                : 'Delete Tickets'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
