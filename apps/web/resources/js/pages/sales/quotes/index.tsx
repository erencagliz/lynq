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
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

interface Quote {
    id: number;
    quote_number: string;
    subject: string;
    total_amount: number;
    currency: string;
    status: string;
    created_at: string;
    account?: { name: string };
    contact?: { first_name: string; last_name: string };
}

interface Props {
    quotes: {
        data: Quote[];
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
    { title: 'Quotes', href: '/quotes' },
];

export default function Index({ quotes, filters }: Props) {
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
    const [quotesToDelete, setQuotesToDelete] = useState<Quote[]>([]);

    const handleDelete = () => {
        if (quoteToDelete) {
            router.delete(`/quotes/${quoteToDelete.id}`, {
                onSuccess: () => setQuoteToDelete(null),
            });
        } else if (quotesToDelete.length > 0) {
            quotesToDelete.forEach((quote, index) => {
                router.delete(`/quotes/${quote.id}`, {
                    onFinish: () => {
                        if (index === quotesToDelete.length - 1) {
                            setQuotesToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Quote>[] = [
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
            accessorKey: 'quote_number',
            header: 'Quote #',
            cell: ({ row }) => (
                <span className="font-bold text-blue-600">
                    {row.original.quote_number}
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
                    <div className="flex flex-col gap-0.5">
                        {account && (
                            <div className="flex items-center gap-1 text-sm font-medium text-neutral-700">
                                <Building2 className="h-3 w-3 text-neutral-400" />
                                {account.name}
                            </div>
                        )}
                        {contact && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <UserIcon className="h-3 w-3 text-neutral-300" />
                                {contact.first_name} {contact.last_name}
                            </div>
                        )}
                        {!account && !contact && (
                            <span className="text-xs text-neutral-400 italic">
                                No recipient
                            </span>
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
                let variant: any = 'outline';
                let className = '';

                if (status === 'Draft')
                    className =
                        'bg-neutral-100 text-neutral-600 border-neutral-200';
                if (status === 'Sent')
                    className = 'bg-blue-50 text-blue-700 border-blue-100';
                if (status === 'Accepted')
                    className =
                        'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (status === 'Declined')
                    className = 'bg-red-50 text-red-700 border-red-100';

                return (
                    <Badge
                        variant={variant}
                        className={`font-bold ${className}`}
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => (
                <span className="font-bold text-neutral-900">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: row.original.currency,
                    }).format(row.original.total_amount)}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <span className="text-xs font-medium text-neutral-500">
                    {format(new Date(row.original.created_at), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const quote = row.original;
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
                                        href={`/quotes/${quote.id}`}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />{' '}
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/quotes/${quote.id}/edit`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setQuoteToDelete(quote)}
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
            <Head title="Quotes" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Quotes</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Number', value: 'quote_number' },
                                { label: 'Subject', value: 'subject' },
                                { label: 'Status', value: 'status' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/quotes/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Quote
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={quotes.data}
                    meta={{
                        current_page: quotes.current_page,
                        last_page: quotes.last_page,
                        total: quotes.total,
                        path: quotes.path,
                        per_page: quotes.per_page,
                    }}
                    filters={filters}
                    placeholder="Search quotes..."
                    onDelete={(rows) => setQuotesToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!quoteToDelete || quotesToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setQuoteToDelete(null), setQuotesToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {quoteToDelete ? (
                                <span>
                                    This will permanently delete the quote{' '}
                                    <strong>
                                        {quoteToDelete.quote_number}
                                    </strong>{' '}
                                    and all related data.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{quotesToDelete.length}</strong>{' '}
                                    quotes and all their related data.
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
                            {quoteToDelete ? 'Delete Quote' : 'Delete Quotes'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
