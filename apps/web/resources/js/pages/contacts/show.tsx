import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskModal } from '@/components/modals/TaskModal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    Account,
    Attachment,
    BreadcrumbItem,
    Contact,
    Deal,
    Invoice,
    Note,
    Quote,
    Task,
    Ticket,
    User,
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Activity,
    Calendar,
    DollarSign,
    FileText,
    History,
    LifeBuoy,
    Plus,
    Receipt,
    Smartphone,
    Trash2,
    TrendingUp,
    UserCircle,
} from 'lucide-react';

import { useState } from 'react';

interface Props {
    contact: Contact & {
        account?: Account;
        manager?: Contact;
        owner?: User;
        creator?: User;
        deals: (Deal & { stage?: any })[];
        tasks: Task[];
        notes: Note[];
        attachments: Attachment[];
        quotes: Quote[];
        invoices: Invoice[];
        tickets: Ticket[];
    };
    users?: User[];
    history_items: any[];
}

export default function Show({
    contact,
    users = [],
    history_items = [],
}: Props) {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contacts', href: '/contacts' },
        {
            title: `${contact.first_name} ${contact.last_name}`,
            href: `/contacts/${contact.id}`,
        },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Active':
                return 'default';
            case 'Inactive':
                return 'secondary';
            case 'Prospect':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const taskColumns: ColumnDef<Task>[] = [
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <span
                        className={
                            row.original.status === 'Completed'
                                ? 'text-neutral-400 line-through'
                                : ''
                        }
                    >
                        {row.original.subject}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-normal">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) =>
                row.original.due_date
                    ? format(new Date(row.original.due_date), 'MMM d, yyyy')
                    : '-',
        },
        { accessorKey: 'status', header: 'Status' },
    ];

    const quoteColumns: ColumnDef<Quote>[] = [
        {
            accessorKey: 'quote_number',
            header: 'Quote #',
            cell: ({ row }) => (
                <Link
                    href={`/quotes/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.original.quote_number}
                </Link>
            ),
        },
        { accessorKey: 'subject', header: 'Subject' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.status}</Badge>
            ),
        },
        {
            accessorKey: 'total_amount',
            header: 'Amount',
            cell: ({ row }) =>
                `$${Number(row.original.total_amount).toLocaleString()}`,
        },
    ];

    const invoiceColumns: ColumnDef<Invoice>[] = [
        {
            accessorKey: 'invoice_number',
            header: 'Invoice #',
            cell: ({ row }) => (
                <Link
                    href={`/invoices/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.original.invoice_number}
                </Link>
            ),
        },
        { accessorKey: 'subject', header: 'Subject' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.status}</Badge>
            ),
        },
        {
            accessorKey: 'total_amount',
            header: 'Amount',
            cell: ({ row }) =>
                `$${Number(row.original.total_amount).toLocaleString()}`,
        },
    ];

    const ticketColumns: ColumnDef<Ticket>[] = [
        {
            accessorKey: 'ticket_number',
            header: 'Ticket #',
            cell: ({ row }) => (
                <Link
                    href={`/tickets/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    #{row.original.ticket_number}
                </Link>
            ),
        },
        { accessorKey: 'subject', header: 'Subject' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.status}</Badge>
            ),
        },
    ];

    const processedLogs = history_items
        .flatMap((item) => {
            const logs = [item];
            if (item.deleted_at) {
                logs.push({
                    ...item,
                    date: item.deleted_at,
                    action: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Deleted`,
                    user: 'System',
                    is_deleted_event: true,
                });
            }
            return logs;
        })
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${contact.first_name} ${contact.last_name}`} />

            <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-4 bg-neutral-100/40 p-4">
                {/* Highlights Panel */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="rounded bg-blue-600 p-2.5 shadow-inner">
                                <UserCircle className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Contact
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-neutral-900">
                                        {contact.first_name} {contact.last_name}
                                    </h1>
                                    <Badge
                                        variant={getStatusVariant(
                                            contact.status || 'Active',
                                        )}
                                        className="h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                                    >
                                        {contact.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 font-medium"
                            >
                                <Link href={`/contacts/${contact.id}/edit`}>
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-3 lg:grid-cols-5">
                        <div className="space-y-1 px-4 text-center">
                            <span className="block text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Email
                            </span>
                            <p className="cursor-pointer truncate text-sm font-semibold hover:text-blue-600">
                                {contact.email || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <span className="block text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Phone
                            </span>
                            <p className="cursor-pointer truncate text-sm font-semibold hover:text-blue-600">
                                {contact.phone || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <span className="block text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Account
                            </span>
                            <p className="truncate text-sm font-semibold">
                                {contact.account ? (
                                    <Link
                                        href={`/accounts/${contact.account.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {contact.account.name}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <span className="block text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Title
                            </span>
                            <p className="truncate text-sm font-semibold">
                                {contact.title || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 px-4 text-center">
                            <span className="block text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Location
                            </span>
                            <p className="truncate text-sm font-semibold">
                                {contact.mailing_city
                                    ? `${contact.mailing_city}, ${contact.mailing_country || ''}`
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Tabs defaultValue="activity" className="w-full">
                            <TabsList className="h-11 w-full max-w-md rounded-xl border bg-neutral-100/50 p-1">
                                <TabsTrigger
                                    value="activity"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Activity className="h-4 w-4" /> Activity
                                </TabsTrigger>
                                <TabsTrigger
                                    value="transactions"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <DollarSign className="h-4 w-4" />{' '}
                                    Transactions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="support"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <LifeBuoy className="h-4 w-4" /> Support
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="activity"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Calendar className="h-4 w-4 text-neutral-400" />{' '}
                                            Tasks ({contact.tasks?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[10px] font-bold tracking-wider uppercase"
                                            onClick={() =>
                                                setIsAddingTask(true)
                                            }
                                        >
                                            <Plus className="mr-1 h-3 w-3" /> New
                                            Task
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={taskColumns}
                                            data={contact.tasks || []}
                                            placeholder="Search tasks..."
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <History className="h-4 w-4 text-neutral-400" />{' '}
                                            Audit History
                                        </h2>
                                    </div>
                                    <div className="p-0">
                                        <div className="divide-y divide-neutral-100">
                                            {processedLogs.length > 0 ? (
                                                processedLogs.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-4 transition-colors hover:bg-neutral-50"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div
                                                                        className={cn(
                                                                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm',
                                                                            item.is_deleted_event
                                                                                ? 'border-red-100 bg-red-50 text-red-600'
                                                                                : item.type ===
                                                                                    'task'
                                                                                    ? 'border-blue-100 bg-blue-50 text-blue-600'
                                                                                    : item.type ===
                                                                                        'note'
                                                                                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                                                                                        : 'border-indigo-100 bg-indigo-50 text-indigo-600',
                                                                        )}
                                                                    >
                                                                        {item.type ===
                                                                            'task' ? (
                                                                            <Calendar className="h-4 w-4" />
                                                                        ) : item.type ===
                                                                            'note' ? (
                                                                            <FileText className="h-4 w-4" />
                                                                        ) : item.is_deleted_event ? (
                                                                            <Trash2 className="h-4 w-4" />
                                                                        ) : (
                                                                            <History className="h-4 w-4" />
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm leading-tight font-bold text-neutral-900">
                                                                            {
                                                                                item.action
                                                                            }
                                                                        </p>
                                                                        {item.new_values && (
                                                                            <div className="mt-2 space-y-1.5 border-l-2 border-neutral-100 py-1 pl-3 text-[11px]">
                                                                                {Object.entries(
                                                                                    item.new_values,
                                                                                ).map(
                                                                                    ([
                                                                                        key,
                                                                                        val,
                                                                                    ]: [
                                                                                            any,
                                                                                            any,
                                                                                        ]) => (
                                                                                        <div
                                                                                            key={
                                                                                                key
                                                                                            }
                                                                                            className="flex items-center gap-2"
                                                                                        >
                                                                                            <span className="w-24 shrink-0 font-bold tracking-tighter text-neutral-500 uppercase">
                                                                                                {key.replace(
                                                                                                    '_',
                                                                                                    ' ',
                                                                                                )}
                                                                                                :
                                                                                            </span>
                                                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                                                <span className="max-w-[100px] truncate text-red-400 line-through">
                                                                                                    {String(
                                                                                                        item
                                                                                                            .old_values?.[
                                                                                                        key
                                                                                                        ] ||
                                                                                                        'None',
                                                                                                    )}
                                                                                                </span>
                                                                                                <TrendingUp className="h-2.5 w-2.5 shrink-0 text-neutral-300" />
                                                                                                <span className="max-w-[150px] truncate font-semibold text-green-600">
                                                                                                    {String(
                                                                                                        val ||
                                                                                                        'None',
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[7px] font-bold">
                                                                                {item.user
                                                                                    ?.split(
                                                                                        ' ',
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            n: any,
                                                                                        ) =>
                                                                                            n[0],
                                                                                    )
                                                                                    .join(
                                                                                        '',
                                                                                    )}
                                                                            </div>
                                                                            <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                                                                                {
                                                                                    item.user
                                                                                }{' '}
                                                                                •{' '}
                                                                                {format(
                                                                                    new Date(
                                                                                        item.date,
                                                                                    ),
                                                                                    'MMM d, p',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="bg-neutral-50/50 p-8 text-center">
                                                    <p className="text-xs text-neutral-400 italic">
                                                        No history available.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="transactions"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <FileText className="h-4 w-4 text-neutral-400" />{' '}
                                            Quotes (
                                            {contact.quotes?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/quotes/create?contact_id=${contact.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Quote
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={quoteColumns}
                                            data={contact.quotes || []}
                                            placeholder="Search quotes..."
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Receipt className="h-4 w-4 text-neutral-400" />{' '}
                                            Invoices (
                                            {contact.invoices?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/invoices/create?contact_id=${contact.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Invoice
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={invoiceColumns}
                                            data={contact.invoices || []}
                                            placeholder="Search invoices..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="support"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <LifeBuoy className="h-4 w-4 text-neutral-400" />{' '}
                                            Tickets (
                                            {contact.tickets?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/tickets/create?contact_id=${contact.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Ticket
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={ticketColumns}
                                            data={contact.tickets || []}
                                            placeholder="Search tickets..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        {/* Related Items Card */}
                        <div className="rounded border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Deals ({contact.deals?.length || 0})
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-1 p-2">
                                {contact.deals && contact.deals.length > 0 ? (
                                    contact.deals.map((deal) => (
                                        <div
                                            key={deal.id}
                                            className="group flex items-center justify-between rounded-md p-3 transition-all hover:bg-neutral-50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/deals/${deal.id}`}
                                                    className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                                >
                                                    {deal.name}
                                                </Link>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase">
                                                    {deal.stage?.name ||
                                                        'Prospecting'}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-neutral-900">
                                                $
                                                {Number(
                                                    deal.value,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No deals found.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="rounded border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Notes ({contact.notes?.length || 0})
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-1 p-2">
                                {contact.notes && contact.notes.length > 0 ? (
                                    contact.notes
                                        .slice(0, 3)
                                        .map((note, idx) => (
                                            <div
                                                key={idx}
                                                className="group flex items-start gap-3 rounded-md border border-transparent p-3 transition-all hover:border-neutral-100 hover:bg-neutral-50"
                                            >
                                                <div className="shrink-0 rounded bg-neutral-100 p-1.5 text-neutral-500">
                                                    <FileText className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="cursor-pointer truncate text-sm font-semibold text-blue-600 hover:underline">
                                                        {note.content}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                                        {format(
                                                            new Date(
                                                                note.created_at,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No notes found.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isAddingTask}
                onClose={() => setIsAddingTask(false)}
                subjectType="App\\Models\\Contact"
                subjectId={contact.id}
                users={users}
            />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .classic-tab {
                    font-size: 0.8125rem;
                    font-weight: 700 !important;
                    color: #444;
                    padding: 0 1rem;
                    border-radius: 0;
                    background: transparent !important;
                }
                .classic-tab[data-state=active] {
                    color: #1a1a1a;
                    box-shadow: none !important;
                }
            `,
                }}
            />
        </AppLayout>
    );
}
