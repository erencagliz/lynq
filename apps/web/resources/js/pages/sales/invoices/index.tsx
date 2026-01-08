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
import {
    Building2,
    MoreHorizontal,
    Pencil,
    Plus,
    Receipt,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

interface Invoice {
    id: number;
    invoice_number: string;
    subject: string;
    total_amount: number;
    currency: string;
    status: string;
    due_date: string;
    created_at: string;
    account?: { name: string };
    contact?: { first_name: string; last_name: string };
}

interface Props {
    invoices: {
        data: Invoice[];
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
    { title: 'Sales', href: '#' },
    { title: 'Invoices', href: '/invoices' },
];

export default function Index({ invoices, filters }: Props) {
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(
        null,
    );
    const [invoicesToDelete, setInvoicesToDelete] = useState<Invoice[]>([]);

    const handleDelete = () => {
        if (invoiceToDelete) {
            router.delete(`/invoices/${invoiceToDelete.id}`, {
                onSuccess: () => setInvoiceToDelete(null),
            });
        } else if (invoicesToDelete.length > 0) {
            invoicesToDelete.forEach((invoice, index) => {
                router.delete(`/invoices/${invoice.id}`, {
                    onFinish: () => {
                        if (index === invoicesToDelete.length - 1) {
                            setInvoicesToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Invoice>[] = [
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
            accessorKey: 'invoice_number',
            header: 'Invoice #',
            cell: ({ row }) => (
                <span className="font-bold tracking-tight text-amber-600">
                    {row.original.invoice_number}
                </span>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <span className="font-medium text-neutral-900">
                    {row.original.subject}
                </span>
            ),
        },
        {
            id: 'recipient',
            header: 'Recipient',
            cell: ({ row }) => {
                const account = row.original.account;
                const contact = row.original.contact;
                return (
                    <div className="flex flex-col">
                        {account && (
                            <div className="flex items-center gap-1 text-sm font-bold text-neutral-800">
                                <Building2 className="h-3 w-3 text-neutral-400" />
                                {account.name}
                            </div>
                        )}
                        {contact && (
                            <div className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                                <UserIcon className="h-2.5 w-2.5" />
                                {contact.first_name} {contact.last_name}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                let colorClass = '';

                if (status === 'Draft')
                    colorClass =
                        'bg-neutral-100 text-neutral-600 border-neutral-200';
                if (status === 'Sent')
                    colorClass = 'bg-blue-50 text-blue-700 border-blue-100';
                if (status === 'Paid')
                    colorClass =
                        'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (status === 'Overdue')
                    colorClass =
                        'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
                if (status === 'Void')
                    colorClass =
                        'bg-neutral-200 text-neutral-500 border-neutral-300 line-through';

                return (
                    <Badge className={`font-bold shadow-sm ${colorClass}`}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => (
                <span className="font-black text-neutral-900">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: row.original.currency,
                    }).format(row.original.total_amount)}
                </span>
            ),
        },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-600">
                        {row.original.due_date
                            ? format(
                                  new Date(row.original.due_date),
                                  'MMM d, yyyy',
                              )
                            : '-'}
                    </span>
                    {row.original.status === 'Sent' &&
                        new Date(row.original.due_date) < new Date() && (
                            <span className="text-[10px] font-black tracking-tighter text-rose-600 uppercase">
                                Overdue
                            </span>
                        )}
                </div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const invoice = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/invoices/${invoice.id}/edit`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setInvoiceToDelete(invoice)}
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
            <Head title="Invoices" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Invoices</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Number', value: 'invoice_number' },
                                { label: 'Subject', value: 'subject' },
                                { label: 'Status', value: 'status' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/invoices/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={invoices.data}
                    meta={{
                        current_page: invoices.current_page,
                        last_page: invoices.last_page,
                        total: invoices.total,
                        path: invoices.path,
                        per_page: invoices.per_page,
                    }}
                    filters={filters}
                    placeholder="Search invoices..."
                    onDelete={(rows) => setInvoicesToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!invoiceToDelete || invoicesToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setInvoiceToDelete(null), setInvoicesToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {invoiceToDelete ? (
                                <span>
                                    This will permanently delete the invoice{' '}
                                    <strong>
                                        {invoiceToDelete.invoice_number}
                                    </strong>{' '}
                                    and all related data.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{invoicesToDelete.length}</strong>{' '}
                                    invoices and all their related data.
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
                            {invoiceToDelete
                                ? 'Delete Invoice'
                                : 'Delete Invoices'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
