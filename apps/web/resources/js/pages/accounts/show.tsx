import { DataTable } from '@/components/data-table';
import { SearchableSelect } from '@/components/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TaskModal } from '@/components/modals/TaskModal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import * as accountsRoutes from '@/routes/accounts';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Activity,
    Building2,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    DollarSign,
    Download,
    Eye,
    File,
    FileArchive,
    FileText,
    FileText as FileTextIcon,
    History,
    Image as ImageIcon,
    LifeBuoy,
    MoreHorizontal,
    Pencil,
    Plus,
    Receipt,
    Trash2,
    TrendingUp,
    UploadCloud,
    Users,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    account: Account & {
        contacts: Contact[];
        deals: (Deal & { pipeline?: any; stage?: any })[];
        tasks: Task[];
        notes: Note[];
        attachments: Attachment[];
        children: Account[];
        quotes: Quote[];
        invoices: Invoice[];
        tickets: Ticket[];
        creator?: User;
        owner?: User;
    };
    users?: User[];
    history_items: any[];
}

export default function Show({
    account,
    users = [],
    history_items = [],
}: Props) {
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTab, setActiveTab] = useState('activity');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounts', href: accountsRoutes.index().url },
        { title: account.name, href: accountsRoutes.show(account.id).url },
    ];

    const noteForm = useForm({
        notable_id: account.id,
        notable_type: 'App\\Models\\Account',
        content: '',
    });

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.post('/notes', {
            onSuccess: () => {
                noteForm.reset('content');
                setIsAddingNote(false);
            },
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            router.post(
                '/attachments',
                {
                    attachable_id: account.id,
                    attachable_type: 'App\\Models\\Account',
                    file,
                },
                {
                    onSuccess: () => {
                        if (fileInputRef.current)
                            fileInputRef.current.value = '';
                    },
                },
            );
        }
    };

    const toggleTaskStatus = (task: Task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        router.patch(
            `/tasks/${task.id}/status`,
            {
                status: newStatus,
            },
            {
                preserveScroll: true,
            },
        );
    };

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

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'Deferred':
                return <Clock className="h-4 w-4 text-orange-500" />;
            default:
                return <Circle className="h-4 w-4 text-neutral-400" />;
        }
    };

    const getFileIcon = (mime: string) => {
        if (mime.includes('image'))
            return <ImageIcon className="h-8 w-8 text-neutral-500" />;
        if (mime.includes('pdf'))
            return <FileTextIcon className="h-8 w-8 text-neutral-500" />;
        if (mime.includes('zip') || mime.includes('archive'))
            return <FileArchive className="h-8 w-8 text-neutral-500" />;
        return <File className="h-8 w-8 text-neutral-500" />;
    };

    // Columns
    const contactColumns: ColumnDef<Contact>[] = [
        {
            accessorKey: 'full_name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                        {row.original.first_name[0]}
                        {row.original.last_name[0]}
                    </div>
                    <Link
                        href={`/contacts/${row.original.id}`}
                        className="font-medium hover:underline"
                    >
                        {row.original.first_name} {row.original.last_name}
                    </Link>
                </div>
            ),
        },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'department', header: 'Department' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'phone', header: 'Phone' },
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
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this contact?',
                                            )
                                        ) {
                                            router.delete(
                                                `/contacts/${contact.id}`,
                                            );
                                        }
                                    }}
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

    const dealColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Deal Name',
            cell: ({ row }) => (
                <Link
                    href={`/deals/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'stage.name',
            header: 'Stage',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.stage?.name || 'N/A'}
                </Badge>
            ),
        },
        {
            accessorKey: 'value',
            header: 'Amount',
            cell: ({ row }) =>
                `$${Number(row.getValue('value')).toLocaleString()}`,
        },
        {
            accessorKey: 'expected_close_date',
            header: 'Close Date',
            cell: ({ row }) =>
                row.getValue('expected_close_date')
                    ? format(
                        new Date(row.getValue('expected_close_date')),
                        'MMM d, yyyy',
                    )
                    : '-',
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
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this deal?',
                                            )
                                        ) {
                                            router.delete(`/deals/${deal.id}`);
                                        }
                                    }}
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

    const taskColumns: ColumnDef<Task>[] = [
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        onClick={() => toggleTaskStatus(row.original)}
                    >
                        {getTaskStatusIcon(row.original.status)}
                    </Button>
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
        {
            accessorKey: 'assignee.name',
            header: 'Assigned To',
            cell: ({ row }) => row.original.assignee?.name || 'Unassigned',
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const task = row.original;
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
                                <DropdownMenuItem
                                    onClick={() => toggleTaskStatus(task)}
                                    className="cursor-pointer"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-neutral-500" />
                                    {task.status === 'Completed'
                                        ? 'Mark Pending'
                                        : 'Mark Completed'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this task?',
                                            )
                                        ) {
                                            router.delete(`/tasks/${task.id}`);
                                        }
                                    }}
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
        {
            accessorKey: 'valid_until',
            header: 'Valid Until',
            cell: ({ row }) =>
                row.original.valid_until
                    ? format(new Date(row.original.valid_until), 'MMM d, yyyy')
                    : '-',
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
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) =>
                row.original.due_date
                    ? format(new Date(row.original.due_date), 'MMM d, yyyy')
                    : '-',
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
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.priority}</Badge>
            ),
        },
        {
            accessorKey: 'assignee.name',
            header: 'Agent',
            cell: ({ row }) => row.original.assignee?.name || 'Unassigned',
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
                    user: 'System', // SoftDeletes doesn't track deleter by default
                    is_deleted_event: true,
                });
            }
            return logs;
        })
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

    const totalDealValue = account.deals.reduce(
        (sum, d) => sum + Number(d.value || 0),
        0,
    );
    const completedTasks = account.tasks.filter(
        (t) => t.status === 'Completed',
    ).length;
    const taskCompletionRate =
        account.tasks.length > 0
            ? Math.round((completedTasks / account.tasks.length) * 100)
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={account.name} />

            <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-4 bg-neutral-100/40 p-4">
                {/* Highlights Panel */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="rounded bg-neutral-800 p-2.5 shadow-inner">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Account
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-neutral-900">
                                        {account.name}
                                    </h1>
                                    <Badge
                                        variant={getStatusVariant(
                                            account.status || 'Active',
                                        )}
                                        className="h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                                    >
                                        {account.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="mr-2 flex -space-x-1 rounded-full border bg-neutral-50 px-3 py-1">
                                {account.owner && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                            {account.owner.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <span className="text-xs font-medium text-neutral-600">
                                            {account.owner.name}
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
                                <Link
                                    href={accountsRoutes.edit(account.id).url}
                                >
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
                                        onClick={() => setIsAddingTask(true)}
                                        className="cursor-pointer"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />{' '}
                                        Log Activity
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setIsAddingNote(true)}
                                        className="cursor-pointer"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />{' '}
                                        New Note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="cursor-pointer"
                                    >
                                        <UploadCloud className="mr-2 h-4 w-4" />{' '}
                                        Upload File
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-3 lg:grid-cols-5">
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Main Phone
                            </Label>
                            <p className="cursor-pointer truncate text-sm font-semibold hover:text-blue-600">
                                {account.phone || '—'}
                            </p>
                        </div>
                        <div className="hidden space-y-1 border-l-0 px-4 text-center md:block">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Website
                            </Label>
                            <p className="cursor-pointer truncate text-sm font-semibold hover:text-blue-600">
                                {account.website || '—'}
                            </p>
                        </div>
                        <div className="hidden space-y-1 border-l-0 px-4 text-center lg:block">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Industry
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {account.industry || '—'}
                            </p>
                        </div>
                        <div className="hidden space-y-1 border-l-0 px-4 text-center lg:block">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Ownership
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {account.ownership || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Location
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {account.address_city
                                    ? `${account.address_city}, ${account.address_country || ''}`
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    {/* Main Content Area */}
                    {/* Main Content Area */}
                    {/* Main Content Area - Tasks Card */}
                    {/* Main Content Area */}
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
                                            Tasks ({account.tasks.length})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            onClick={() =>
                                                setIsAddingTask(true)
                                            }
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                            New Task
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={taskColumns}
                                            data={account.tasks}
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
                                            Quotes ({account.quotes.length})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/quotes/create?account_id=${account.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Quote
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={quoteColumns}
                                            data={account.quotes}
                                            placeholder="Search quotes..."
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Receipt className="h-4 w-4 text-neutral-400" />{' '}
                                            Invoices ({account.invoices.length})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/invoices/create?account_id=${account.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Invoice
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={invoiceColumns}
                                            data={account.invoices}
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
                                            Tickets ({account.tickets.length})
                                        </h2>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                                            asChild
                                        >
                                            <Link
                                                href={`/tickets/create?account_id=${account.id}`}
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />{' '}
                                                New Ticket
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={ticketColumns}
                                            data={account.tickets}
                                            placeholder="Search tickets..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar / Related Lists */}
                    <div className="space-y-4">
                        {/* Contacts Card */}
                        <div className="rounded border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Contacts ({account.contacts.length})
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    <Link href="/contacts/create">New</Link>
                                </Button>
                            </div>
                            <div className="space-y-1 p-2">
                                {account.contacts.length > 0 ? (
                                    <>
                                        {account.contacts
                                            .slice(0, 3)
                                            .map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="group flex items-start gap-3 rounded-md border border-transparent p-3 transition-all hover:border-neutral-100 hover:bg-neutral-50"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-50 text-xs font-bold text-blue-700 uppercase">
                                                        {contact.first_name[0]}
                                                        {contact.last_name[0]}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/contacts/${contact.id}`}
                                                            className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                                        >
                                                            {contact.first_name}{' '}
                                                            {contact.last_name}
                                                        </Link>
                                                        <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                                            {contact.title ||
                                                                'No Title'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 shrink-0 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to delete this contact?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/contacts/${contact.id}`,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        {account.contacts.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-full text-[11px] font-bold tracking-wider text-blue-600 uppercase"
                                                onClick={() =>
                                                    setActiveTab('related')
                                                }
                                            >
                                                View All
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="m-2 rounded border border-dashed bg-neutral-50/30 p-8 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No contacts assigned.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deals Card */}
                        <div className="rounded border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Deals ({account.deals.length})
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    <Link href="/deals/create">New</Link>
                                </Button>
                            </div>
                            <div className="space-y-1 p-2">
                                {account.deals.length > 0 ? (
                                    <>
                                        {account.deals
                                            .slice(0, 3)
                                            .map((deal) => (
                                                <div
                                                    key={deal.id}
                                                    className="group rounded-md border border-transparent p-3 transition-all hover:border-neutral-100 hover:bg-neutral-50"
                                                >
                                                    <div className="mb-1 flex items-start justify-between gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <Link
                                                                href={`/deals/${deal.id}`}
                                                                className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {deal.name}
                                                            </Link>
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-2">
                                                            <span className="text-xs font-bold whitespace-nowrap text-neutral-900">
                                                                $
                                                                {Number(
                                                                    deal.value,
                                                                ).toLocaleString()}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            'Are you sure you want to delete this deal?',
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            `/deals/${deal.id}`,
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="h-4 px-1 text-[10px] font-bold"
                                                        >
                                                            {deal.stage?.name ||
                                                                'Prospecting'}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                            {deal.expected_close_date
                                                                ? format(
                                                                    new Date(
                                                                        deal.expected_close_date,
                                                                    ),
                                                                    'MMM d, yyyy',
                                                                )
                                                                : 'No Date'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        {account.deals.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-full text-[11px] font-bold tracking-wider text-blue-600 uppercase"
                                                onClick={() =>
                                                    setActiveTab('related')
                                                }
                                            >
                                                View All
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="m-2 rounded border border-dashed bg-neutral-50/30 p-8 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No active deals found.
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
                                        Notes ({account.notes?.length || 0})
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingNote(true)}
                                    className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    New
                                </Button>
                            </div>
                            <div className="space-y-1 p-2">
                                {account.notes && account.notes.length > 0 ? (
                                    <>
                                        {account.notes
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.created_at,
                                                    ).getTime() -
                                                    new Date(
                                                        a.created_at,
                                                    ).getTime(),
                                            )
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 shrink-0 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to delete this note?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/notes/${note.id}`,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        {account.notes.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-full text-[11px] font-bold tracking-wider text-blue-600 uppercase"
                                                onClick={() =>
                                                    setActiveTab('related')
                                                }
                                            >
                                                View All
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="m-2 rounded border border-dashed bg-neutral-50/30 p-8 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No notes found.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attachments Card */}
                        <div className="rounded border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-neutral-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-neutral-400" />
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Attachments (
                                        {account.attachments?.length || 0})
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="h-7 p-0 px-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    Upload
                                </Button>
                            </div>
                            <div className="space-y-1 p-2">
                                {account.attachments &&
                                    account.attachments.length > 0 ? (
                                    <>
                                        {account.attachments
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.created_at,
                                                    ).getTime() -
                                                    new Date(
                                                        a.created_at,
                                                    ).getTime(),
                                            )
                                            .slice(0, 3)
                                            .map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-start gap-3 rounded-md border border-transparent p-3 transition-all hover:border-neutral-100 hover:bg-neutral-50"
                                                >
                                                    <div className="shrink-0 rounded bg-neutral-100 p-1.5 text-neutral-500">
                                                        <File className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <a
                                                            href={
                                                                file.file_path
                                                            }
                                                            target="_blank"
                                                            className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                                                        >
                                                            {file.file_name}
                                                        </a>
                                                        <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                                                            {format(
                                                                new Date(
                                                                    file.created_at,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        <a
                                                            href={
                                                                file.file_path
                                                            }
                                                            target="_blank"
                                                            className="p-2 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-600"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        'Are you sure you want to delete this attachment?',
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        `/attachments/${file.id}`,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        {account.attachments.length > 3 && (
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-full text-[11px] font-bold tracking-wider text-blue-600 uppercase"
                                                onClick={() =>
                                                    setActiveTab('related')
                                                }
                                            >
                                                View All
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="m-2 rounded border border-dashed bg-neutral-50/30 p-8 text-center">
                                        <p className="text-xs text-neutral-400">
                                            No attachments found.
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
                subjectType="App\\Models\\Account"
                subjectId={account.id}
                users={users}
            />

            <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Note</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitNote} className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="content">Note Content</Label>
                            <Textarea
                                id="content"
                                value={noteForm.data.content}
                                onChange={(e) =>
                                    noteForm.setData('content', e.target.value)
                                }
                                placeholder="Write your note here..."
                                className="min-h-[150px]"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingNote(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={noteForm.processing}
                            >
                                Save Note
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
