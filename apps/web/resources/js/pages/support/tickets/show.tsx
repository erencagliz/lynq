import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Task, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Activity,
    Building2,
    Calendar,
    History,
    LifeBuoy,
    MessageSquare,
    MoreHorizontal,
    Trash2,
    TrendingUp,
    User as UserIcon,
} from 'lucide-react';

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    assignee?: User;
    account?: { id: number; name: string };
    contact?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    tasks?: Task[];
    activities?: any[];
}

interface Props {
    ticket: Ticket;
    history_items?: any[];
}

export default function Show({ ticket, history_items = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Support', href: '#' },
        { title: 'Tickets', href: '/tickets' },
        { title: `#${ticket.ticket_number}`, href: `/tickets/${ticket.id}` },
    ];

    const updateStatus = (newStatus: string) => {
        router.patch(`/tickets/${ticket.id}`, { status: newStatus });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Open':
                return 'destructive';
            case 'In Progress':
                return 'secondary';
            case 'Resolved':
                return 'default';
            case 'Closed':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const processedLogs = (history_items || [])
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
            <Head title={`Ticket #${ticket.ticket_number}`} />

            <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-4 bg-neutral-100/40 p-4">
                {/* Highlights Panel */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="rounded bg-rose-600 p-2.5 shadow-inner">
                                <LifeBuoy className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Ticket #{ticket.ticket_number}
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-neutral-900">
                                        {ticket.subject}
                                    </h1>
                                    <Badge
                                        variant={getStatusVariant(
                                            ticket.status,
                                        )}
                                        className="h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                                    >
                                        {ticket.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-8 font-medium"
                                    >
                                        Status: {ticket.status}{' '}
                                        <MoreHorizontal className="ml-1.5 h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={() => updateStatus('Open')}
                                    >
                                        Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            updateStatus('In Progress')
                                        }
                                    >
                                        In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateStatus('Resolved')}
                                    >
                                        Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateStatus('Closed')}
                                    >
                                        Closed
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 font-medium"
                            >
                                <Link href={`/tickets/${ticket.id}/edit`}>
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-3 lg:grid-cols-5">
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Priority
                            </Label>
                            <p
                                className={cn(
                                    'truncate text-sm font-bold',
                                    ticket.priority === 'Urgent'
                                        ? 'text-rose-600'
                                        : ticket.priority === 'High'
                                          ? 'text-orange-600'
                                          : 'text-blue-600',
                                )}
                            >
                                {ticket.priority}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Created
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-700">
                                {format(
                                    new Date(ticket.created_at),
                                    'MMM d, yyyy',
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Account
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-900">
                                {ticket.account ? (
                                    <Link
                                        href={`/accounts/${ticket.account.id}`}
                                        className="font-black tracking-tight uppercase underline decoration-neutral-200 decoration-dotted transition-colors hover:text-blue-600"
                                    >
                                        {ticket.account.name}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Assignee
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-700">
                                {ticket.assignee?.name || 'Unassigned'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                SLA Status
                            </Label>
                            <p className="truncate text-sm font-semibold text-emerald-600">
                                Active
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Tabs defaultValue="case" className="w-full">
                            <TabsList className="h-11 w-full max-w-md rounded-xl border bg-neutral-100/50 p-1">
                                <TabsTrigger
                                    value="case"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <MessageSquare className="h-4 w-4" /> Case
                                    Info
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Activity className="h-4 w-4" /> Audit
                                    History
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tasks"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Calendar className="h-4 w-4" /> Tasks
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="case"
                                className="mt-4 space-y-4"
                            >
                                <Card className="shadow-sm">
                                    <CardHeader className="border-b bg-neutral-50/50 pb-3">
                                        <CardTitle className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                                            Description
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">
                                            {ticket.description}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col items-center justify-center overflow-hidden rounded border bg-white p-8 text-center opacity-60 shadow-sm">
                                    <div className="mb-3 rounded-full bg-neutral-50 p-3">
                                        <MessageSquare className="h-6 w-6 text-neutral-300" />
                                    </div>
                                    <h4 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
                                        Discussion (Coming Soon)
                                    </h4>
                                    <p className="mt-1 max-w-[200px] text-xs text-neutral-400">
                                        Comments and team discussion will appear
                                        here in the next update.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="activity"
                                className="mt-4 space-y-4"
                            >
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
                                                                                : 'border-indigo-100 bg-indigo-50 text-indigo-600',
                                                                        )}
                                                                    >
                                                                        {item.is_deleted_event ? (
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
                                value="tasks"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Calendar className="h-4 w-4 text-neutral-400" />{' '}
                                            Tasks ({ticket.tasks?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={[
                                                {
                                                    accessorKey: 'subject',
                                                    header: 'Subject',
                                                },
                                                {
                                                    accessorKey: 'status',
                                                    header: 'Status',
                                                },
                                                {
                                                    accessorKey: 'due_date',
                                                    header: 'Due Date',
                                                    cell: ({ row }: any) =>
                                                        row.original.due_date
                                                            ? format(
                                                                  new Date(
                                                                      row.original.due_date,
                                                                  ),
                                                                  'MMM d, yyyy',
                                                              )
                                                            : '-',
                                                },
                                            ]}
                                            data={ticket.tasks || []}
                                            placeholder="Search tasks..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="border-b bg-neutral-50/50 pb-3">
                                <CardTitle className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <UserIcon className="h-3.5 w-3.5" />{' '}
                                    Requester Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Contact
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded border bg-blue-50 text-[10px] font-bold text-blue-700">
                                            {ticket.contact?.first_name[0]}
                                            {ticket.contact?.last_name[0]}
                                        </div>
                                        <div>
                                            {ticket.contact ? (
                                                <Link
                                                    href={`/contacts/${ticket.contact.id}`}
                                                    className="transition-colors hover:text-blue-600"
                                                >
                                                    <p className="text-sm font-semibold text-neutral-700">
                                                        {
                                                            ticket.contact
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            ticket.contact
                                                                .last_name
                                                        }
                                                    </p>
                                                    <p className="text-[10px] font-medium text-neutral-400">
                                                        {ticket.contact.email}
                                                    </p>
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-semibold text-neutral-700 italic">
                                                    No contact
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 border-t border-neutral-50 pt-2">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Account
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-neutral-400" />
                                        {ticket.account ? (
                                            <Link
                                                href={`/accounts/${ticket.account.id}`}
                                                className="text-sm font-semibold tracking-tight text-neutral-700 uppercase transition-colors hover:text-blue-600"
                                            >
                                                {ticket.account.name}
                                            </Link>
                                        ) : (
                                            <span className="text-sm font-semibold text-neutral-700 italic">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
