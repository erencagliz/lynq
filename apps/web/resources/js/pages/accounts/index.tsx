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
import * as accountsRoutes from '@/routes/accounts';
import { Account, BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Building2,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: '/accounts',
    },
];

interface Props {
    accounts: {
        data: Account[];
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

export default function Index({ accounts, filters }: Props) {
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(
        null,
    );
    const [accountsToDelete, setAccountsToDelete] = useState<Account[]>([]);

    const handleDelete = () => {
        if (accountToDelete) {
            router.delete(accountsRoutes.destroy(accountToDelete.id).url, {
                onSuccess: () => setAccountToDelete(null),
            });
        } else if (accountsToDelete.length > 0) {
            // Send individual delete requests as requested by user
            accountsToDelete.forEach((account, index) => {
                router.delete(accountsRoutes.destroy(account.id).url, {
                    onFinish: () => {
                        if (index === accountsToDelete.length - 1) {
                            setAccountsToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Account>[] = [
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
            cell: ({ row }) => {
                const account = row.original;
                return (
                    <Link
                        href={accountsRoutes.show(account.id).url}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {account.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'account_type',
            header: 'Type',
            cell: ({ row }) => {
                const account = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {account.account_type || '-'}
                        </span>
                        {account.website && (
                            <a
                                href={account.website}
                                target="_blank"
                                className="max-w-[150px] truncate text-xs text-neutral-400 hover:underline"
                            >
                                {account.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'owner',
            header: 'Owner',
            cell: ({ row }) => {
                const owner = row.original.owner;
                if (!owner)
                    return (
                        <div className="text-sm text-neutral-400 italic">
                            Unassigned
                        </div>
                    );
                return (
                    <div className="flex items-center gap-2">
                        <UserInfo user={owner} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'industry',
            header: 'Industry',
            cell: ({ row }) => <span>{row.getValue('industry') || '-'}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className="text-[10px] font-bold tracking-wider uppercase"
                >
                    {row.getValue('status')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const account = row.original;
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
                                        href={
                                            accountsRoutes.show(account.id).url
                                        }
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={
                                            accountsRoutes.edit(account.id).url
                                        }
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setAccountToDelete(account)}
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
            <Head title="Accounts" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Accounts</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Name', value: 'name' },
                                { label: 'Industry', value: 'industry' },
                                { label: 'City', value: 'address_city' },
                                { label: 'Website', value: 'website' },
                            ]}
                        />
                        <Button asChild>
                            <Link href={accountsRoutes.create().url}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Account
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={accounts.data}
                    meta={{
                        current_page: accounts.current_page,
                        last_page: accounts.last_page,
                        total: accounts.total,
                        path: accounts.path,
                        per_page: accounts.per_page,
                    }}
                    filters={filters}
                    placeholder="Search accounts..."
                    onDelete={(rows) => setAccountsToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!accountToDelete || accountsToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setAccountToDelete(null), setAccountsToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {accountToDelete ? (
                                <span>
                                    This will permanently delete the account{' '}
                                    <strong>{accountToDelete.name}</strong> and
                                    all related data.
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{accountsToDelete.length}</strong>{' '}
                                    accounts and all their related data.
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
                            {accountToDelete
                                ? 'Delete Account'
                                : 'Delete Accounts'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
