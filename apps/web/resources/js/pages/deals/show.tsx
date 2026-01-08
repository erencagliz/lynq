import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
    User,
} from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Activity as ActivityIcon,
    Building2,
    Calendar,
    DollarSign,
    FileIcon,
    FileText,
    History,
    Mail,
    Phone,
    Plus,
    Receipt,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Activity {
    id: number;
    type: 'note' | 'call' | 'email' | 'meeting';
    description: string;
    performed_at: string;
    user?: {
        name: string;
        profile_photo_url?: string;
    };
    created_at: string;
}

interface Props {
    deal: Deal & {
        account?: Account;
        contact?: Contact;
        pipeline?: any;
        stage?: any;
        owner?: User;
        activities?: Activity[];
        tasks: Task[];
        notes: Note[];
        attachments: Attachment[];
        quotes: Quote[];
        invoices: Invoice[];
    };
    history_items: any[];
}

export default function Show({ deal, history_items = [] }: Props) {
    const [isAddingActivity, setIsAddingActivity] = useState(false);

    const activityForm = useForm({
        subject_type: 'App\\Models\\Deal',
        subject_id: deal.id,
        type: 'note',
        description: '',
        performed_at: new Date().toISOString(),
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Deals', href: '/deals' },
        { title: deal.name, href: `/deals/${deal.id}` },
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

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this deal?')) {
            router.delete(`/deals/${deal.id}`);
        }
    };

    const handleDeleteActivity = (id: number) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            router.delete(`/activities/${id}`, { preserveScroll: true });
        }
    };

    const submitActivity = (e: React.FormEvent) => {
        e.preventDefault();
        activityForm.post('/activities', {
            onSuccess: () => {
                setIsAddingActivity(false);
                activityForm.reset('description');
            },
            preserveScroll: true,
        });
    };

    const activityColumns: ColumnDef<Activity>[] = [
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
                let icon = <FileText className="h-4 w-4 text-neutral-400" />;

                switch (type) {
                    case 'call':
                        icon = <Phone className="h-4 w-4 text-neutral-400" />;
                        break;
                    case 'email':
                        icon = <Mail className="h-4 w-4 text-neutral-400" />;
                        break;
                    case 'meeting':
                        icon = <Users className="h-4 w-4 text-neutral-400" />;
                        break;
                }

                return (
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-xs font-medium text-neutral-700 capitalize">
                            {type}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div
                    className="max-w-[400px] truncate text-sm text-neutral-600"
                    title={row.getValue('description')}
                >
                    {row.getValue('description')}
                </div>
            ),
        },
        {
            accessorKey: 'user.name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[7px] font-bold">
                        {row.original.user?.name
                            .split(' ')
                            .map((n: any) => n[0])
                            .join('')}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-500">
                        {row.original.user?.name}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => (
                <span className="text-[11px] text-neutral-500">
                    {format(new Date(row.original.created_at), 'MMM d, p')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-600"
                        onClick={() => handleDeleteActivity(row.original.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={deal.name} />

            <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-4 bg-neutral-100/40 p-4">
                {/* Header Highlights Panel - Matching Account View */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="rounded bg-emerald-600 p-2.5 shadow-inner">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Deal
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-neutral-900">
                                        {deal.name}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="h-5 border-emerald-100 bg-emerald-50 px-1.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase"
                                    >
                                        {deal.stage?.name}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="mr-2 flex -space-x-1 rounded-full border bg-neutral-50 px-3 py-1">
                                {deal.owner && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                            {deal.owner.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <span className="text-xs font-medium text-neutral-600">
                                            {deal.owner.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 font-medium"
                            >
                                <Link href={`/deals/${deal.id}/edit`}>
                                    Edit
                                </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-8 font-medium"
                                    >
                                        Actions{' '}
                                        <Plus className="ml-1.5 h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                        Delete Deal
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-3 lg:grid-cols-6">
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Amount
                            </Label>
                            <p className="truncate text-sm font-bold text-neutral-900">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: deal.currency || 'USD',
                                }).format(deal.value || 0)}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Close Date
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-700">
                                {deal.expected_close_date
                                    ? format(
                                        new Date(deal.expected_close_date),
                                        'MMM d, yyyy',
                                    )
                                    : '—'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Account
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {deal.account ? (
                                    <Link
                                        href={`/accounts/${deal.account.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {deal.account.name}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Probability
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {deal.stage?.probability || '0'}%
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Created At
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-600">
                                {format(
                                    new Date(deal.created_at),
                                    'MMM d, yyyy',
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Pipeline
                            </Label>
                            <p className="truncate text-sm font-semibold tracking-tighter text-neutral-600 uppercase">
                                {deal.pipeline?.name || '—'}
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
                                    <ActivityIcon className="h-4 w-4" />{' '}
                                    Activity
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notes"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <FileText className="h-4 w-4" /> Notes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="attachments"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Plus className="h-4 w-4" /> Files
                                </TabsTrigger>
                                <TabsTrigger
                                    value="transactions"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <DollarSign className="h-4 w-4" />{' '}
                                    Transactions
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="notes"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <FileText className="h-4 w-4 text-neutral-400" />{' '}
                                            Notes ({deal.notes?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="space-y-4 p-4">
                                        {deal.notes?.length ? (
                                            deal.notes.map((note, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-lg border bg-neutral-50/30 p-4"
                                                >
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                            {note.creator?.name}{' '}
                                                            •{' '}
                                                            {format(
                                                                new Date(
                                                                    note.created_at,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap text-neutral-700">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-sm text-neutral-400 italic">
                                                No notes found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="attachments"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Plus className="h-4 w-4 text-neutral-400" />{' '}
                                            Attachments (
                                            {deal.attachments?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        {deal.attachments?.length ? (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {deal.attachments.map(
                                                    (file, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-neutral-50"
                                                        >
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                                                <FileIcon className="h-5 w-5 text-neutral-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-bold text-neutral-900">
                                                                    {
                                                                        file.file_name
                                                                    }
                                                                </p>
                                                                <p className="text-[10px] font-medium text-neutral-500">
                                                                    {(
                                                                        Number(
                                                                            file.file_size,
                                                                        ) / 1024
                                                                    ).toFixed(
                                                                        1,
                                                                    )}{' '}
                                                                    KB •{' '}
                                                                    {format(
                                                                        new Date(
                                                                            file.created_at,
                                                                        ),
                                                                        'MMM d',
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-sm text-neutral-400 italic">
                                                No attachments found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="activity"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <ActivityIcon className="h-4 w-4 text-neutral-400" />{' '}
                                            Recent Activities (
                                            {(deal.activities || []).length})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            onClick={() =>
                                                setIsAddingActivity(true)
                                            }
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                            Log Activity
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={activityColumns}
                                            data={deal.activities || []}
                                            placeholder="Search activities..."
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Calendar className="h-4 w-4 text-neutral-400" />{' '}
                                            Tasks ({deal.tasks?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={taskColumns}
                                            data={deal.tasks || []}
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
                                                                                    'task' ||
                                                                                    item.type ===
                                                                                    'call' ||
                                                                                    item.type ===
                                                                                    'meeting' ||
                                                                                    item.type ===
                                                                                    'email'
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
                                                                        ) : item.type ===
                                                                            'call' ? (
                                                                            <Phone className="h-4 w-4" />
                                                                        ) : item.type ===
                                                                            'email' ? (
                                                                            <Mail className="h-4 w-4" />
                                                                        ) : item.type ===
                                                                            'meeting' ? (
                                                                            <Users className="h-4 w-4" />
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
                                            Quotes ({deal.quotes?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/quotes/create?deal_id=${deal.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Quote
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={quoteColumns}
                                            data={deal.quotes || []}
                                            placeholder="Search quotes..."
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Receipt className="h-4 w-4 text-neutral-400" />{' '}
                                            Invoices (
                                            {deal.invoices?.length || 0})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/invoices/create?deal_id=${deal.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Invoice
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={invoiceColumns}
                                            data={deal.invoices || []}
                                            placeholder="Search invoices..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        {/* Contacts Card */}
                        {deal.contact && (
                            <div className="rounded border bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-neutral-400" />
                                        <h3 className="text-sm font-bold text-neutral-900">
                                            Primary Contact
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        <Link
                                            href={`/contacts/${deal.contact.id}`}
                                        >
                                            View
                                        </Link>
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-sm font-bold text-blue-700 uppercase">
                                            {deal.contact.first_name[0]}
                                            {deal.contact.last_name[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/contacts/${deal.contact.id}`}
                                                className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                            >
                                                {deal.contact.first_name}{' '}
                                                {deal.contact.last_name}
                                            </Link>
                                            <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                                {deal.contact.title ||
                                                    'No Title'}
                                            </p>
                                            <p className="truncate text-[11px] text-neutral-500">
                                                {deal.contact.phone ||
                                                    deal.contact.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Card */}
                        {deal.account && (
                            <div className="rounded border bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-neutral-400" />
                                        <h3 className="text-sm font-bold text-neutral-900">
                                            Account
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        <Link
                                            href={`/accounts/${deal.account.id}`}
                                        >
                                            View
                                        </Link>
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-neutral-100 text-sm font-bold text-neutral-700 uppercase">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/accounts/${deal.account.id}`}
                                                className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                            >
                                                {deal.account.name}
                                            </Link>
                                            <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                                {deal.account.industry ||
                                                    'No Industry'}
                                            </p>
                                            <p className="truncate text-[11px] text-neutral-500">
                                                {deal.account.address_city ||
                                                    'No Location'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Dialog
                    open={isAddingActivity}
                    onOpenChange={setIsAddingActivity}
                >
                    <DialogContent className="overflow-hidden border-none p-0 shadow-2xl outline-none sm:max-w-[550px]">
                        <div className="border-b bg-neutral-50 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-neutral-900 uppercase">
                                <Plus className="h-4 w-4 text-neutral-400" />{' '}
                                Log Activity
                            </h3>
                        </div>
                        <div className="p-6">
                            <Tabs
                                defaultValue="note"
                                onValueChange={(val) =>
                                    activityForm.setData('type', val as any)
                                }
                                className="w-full"
                            >
                                <TabsList className="mb-6 grid h-11 w-full grid-cols-4 bg-neutral-100 p-1">
                                    <TabsTrigger
                                        value="note"
                                        className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        <FileText className="h-3.5 w-3.5" />{' '}
                                        Note
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="call"
                                        className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        <Phone className="h-3.5 w-3.5" /> Call
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="email"
                                        className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="meeting"
                                        className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    >
                                        <Users className="h-3.5 w-3.5" />{' '}
                                        Meeting
                                    </TabsTrigger>
                                </TabsList>

                                <form
                                    onSubmit={submitActivity}
                                    className="space-y-6"
                                >
                                    <Textarea
                                        placeholder="Write a note, log a call, or describe an activity..."
                                        value={activityForm.data.description}
                                        onChange={(e) =>
                                            activityForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className="min-h-[160px] resize-none border-neutral-200 text-sm leading-relaxed focus:ring-blue-500"
                                        required
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setIsAddingActivity(false)
                                            }
                                            className="h-9 px-4 font-semibold text-neutral-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={activityForm.processing}
                                            className="h-9 bg-blue-600 px-6 font-bold shadow-sm hover:bg-blue-700"
                                        >
                                            {activityForm.processing
                                                ? 'Saving...'
                                                : 'Save Activity'}
                                        </Button>
                                    </div>
                                </form>
                            </Tabs>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
