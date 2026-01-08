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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { BreadcrumbItem, Contact } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Building2,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: '/contacts',
    },
];

interface Props {
    contacts: {
        data: Contact[];
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

export default function Index({ contacts, filters }: Props) {
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(
        null,
    );
    const [contactsToDelete, setContactsToDelete] = useState<Contact[]>([]);

    const handleDelete = () => {
        if (contactToDelete) {
            router.delete(`/contacts/${contactToDelete.id}`, {
                onSuccess: () => setContactToDelete(null),
            });
        } else if (contactsToDelete.length > 0) {
            contactsToDelete.forEach((contact, index) => {
                router.delete(`/contacts/${contact.id}`, {
                    onFinish: () => {
                        if (index === contactsToDelete.length - 1) {
                            setContactsToDelete([]);
                        }
                    },
                    preserveScroll: true,
                });
            });
        }
    };

    const columns: ColumnDef<Contact>[] = [
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
            accessorKey: 'full_name',
            header: 'Name',
            cell: ({ row }) => {
                const contact = row.original;
                const initials =
                    `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase();
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-neutral-100 text-xs text-neutral-500">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <Link
                                href={`/contacts/${contact.id}`}
                                className="font-medium text-blue-600 hover:underline"
                            >
                                {contact.first_name} {contact.last_name}
                            </Link>
                            {contact.title && (
                                <span className="text-xs text-neutral-500">
                                    {contact.title}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'account.name',
            header: 'Account',
            cell: ({ row }) => {
                const account = row.original.account;
                if (!account)
                    return <span className="text-neutral-400">—</span>;
                return (
                    <Link
                        href={`/accounts/${account.id}`}
                        className="flex items-center gap-2 hover:underline"
                    >
                        <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                        {account.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) =>
                row.getValue('email') || (
                    <span className="text-neutral-400">—</span>
                ),
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) =>
                row.getValue('phone') || (
                    <span className="text-neutral-400">—</span>
                ),
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
            accessorKey: 'owner.name',
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
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const contact = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
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
                                        href={`/contacts/${contact.id}`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />
                                        View details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/contacts/${contact.id}/edit`}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
                                        Edit contact
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => setContactToDelete(contact)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete contact
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
            <Head title="Contacts" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Contacts
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'First Name', value: 'first_name' },
                                { label: 'Last Name', value: 'last_name' },
                                { label: 'Email', value: 'email' },
                                { label: 'Phone', value: 'phone' },
                                { label: 'Job Title', value: 'title' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/contacts/create">
                                <Plus className="mr-2 h-4 w-4" /> New Contact
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={contacts.data}
                    meta={{
                        current_page: contacts.current_page,
                        last_page: contacts.last_page,
                        total: contacts.total,
                        path: contacts.path,
                        per_page: contacts.per_page,
                    }}
                    filters={filters}
                    placeholder="Search contacts..."
                    onDelete={(rows) => setContactsToDelete(rows)}
                    hideToolbar={true}
                />
            </div>

            <AlertDialog
                open={!!contactToDelete || contactsToDelete.length > 0}
                onOpenChange={(open: boolean) =>
                    !open && (setContactToDelete(null), setContactsToDelete([]))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {contactToDelete ? (
                                <span>
                                    This will permanently delete the contact{' '}
                                    <strong>
                                        {contactToDelete.first_name}{' '}
                                        {contactToDelete.last_name}
                                    </strong>
                                    .
                                </span>
                            ) : (
                                <span>
                                    This will permanently delete{' '}
                                    <strong>{contactsToDelete.length}</strong>{' '}
                                    contacts.
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
                            {contactToDelete
                                ? 'Delete Contact'
                                : 'Delete Contacts'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
