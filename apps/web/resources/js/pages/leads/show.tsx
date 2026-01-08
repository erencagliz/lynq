import { DataTable } from '@/components/data-table';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Attachment, Note, Task, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowRight,
    Calendar,
    FileText,
    History,
    MapPin,
    Plus,
    Trash2,
    TrendingUp,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    title: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    created_at: string;
    user?: User;
    activities?: any[];
    tasks?: Task[];
    notes?: Note[];
    attachments?: Attachment[];
}

interface Props {
    lead: Lead;
    history_items?: any[];
}

export default function Show({ lead, history_items = [] }: Props) {
    const [confirmConvert, setConfirmConvert] = useState(false);

    const handleConvert = () => {
        router.post(
            `/leads/${lead.id}/convert`,
            {},
            {
                onSuccess: () => setConfirmConvert(false),
            },
        );
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lead?')) {
            router.delete(`/leads/${lead.id}`);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New':
                return 'default';
            case 'Contacted':
                return 'secondary';
            case 'Qualified':
                return 'outline';
            case 'Lost':
                return 'destructive';
            case 'Converted':
                return 'secondary';
            default:
                return 'outline';
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
        <AppLayout
            breadcrumbs={[
                { title: 'Leads', href: '/leads' },
                {
                    title: `${lead.first_name} ${lead.last_name}`,
                    href: `/leads/${lead.id}`,
                },
            ]}
        >
            <Head title={`${lead.first_name} ${lead.last_name}`} />

            <div className="mx-auto min-h-screen w-full max-w-[1600px] space-y-4 bg-neutral-100/40 p-4">
                {/* Highlights Panel */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="rounded bg-blue-600 p-2.5 shadow-inner">
                                <UserIcon className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Lead
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-neutral-900">
                                        {lead.first_name} {lead.last_name}
                                    </h1>
                                    <Badge
                                        variant={getStatusVariant(lead.status)}
                                        className="h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase"
                                    >
                                        {lead.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmConvert(true)}
                                className="h-8 gap-2 font-medium"
                            >
                                <ArrowRight className="h-4 w-4" /> Convert
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 font-medium"
                            >
                                <Link href={`/leads/${lead.id}/edit`}>
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-3 lg:grid-cols-5">
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Email
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {lead.email ? (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="font-black tracking-tight uppercase underline decoration-neutral-200 decoration-dotted transition-colors hover:text-blue-600"
                                    >
                                        {lead.email}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Phone
                            </Label>
                            <p className="truncate text-sm font-semibold">
                                {lead.phone ? (
                                    <a
                                        href={`tel:${lead.phone}`}
                                        className="font-black tracking-tight uppercase underline decoration-neutral-200 decoration-dotted transition-colors hover:text-blue-600"
                                    >
                                        {lead.phone}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Company
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-900">
                                {lead.company || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Source
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-700">
                                {lead.source || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Created
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-600">
                                {format(
                                    new Date(lead.created_at),
                                    'MMM d, yyyy',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Tabs defaultValue="tasks" className="w-full">
                            <TabsList className="h-11 w-full max-w-lg rounded-xl border bg-neutral-100/50 p-1">
                                <TabsTrigger
                                    value="tasks"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Calendar className="h-4 w-4" /> Tasks
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
                                    value="history"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <History className="h-4 w-4" /> History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="tasks"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <Calendar className="h-4 w-4 text-neutral-400" />{' '}
                                            Related Tasks (
                                            {lead.tasks?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <DataTable
                                            columns={taskColumns}
                                            data={lead.tasks || []}
                                            placeholder="Search tasks..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="notes"
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-hidden rounded border bg-white shadow-sm">
                                    <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                            <FileText className="h-4 w-4 text-neutral-400" />{' '}
                                            Notes ({lead.notes?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="space-y-4 p-4">
                                        {lead.notes?.length ? (
                                            lead.notes.map((note, idx) => (
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
                                            {lead.attachments?.length || 0})
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        {lead.attachments?.length ? (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {lead.attachments.map(
                                                    (file, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-neutral-50"
                                                        >
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                                                <FileText className="h-5 w-5 text-neutral-400" />
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
                                value="history"
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
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="border-b bg-neutral-50/50 pb-3">
                                <CardTitle className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <UserIcon className="h-3.5 w-3.5" /> Lead
                                    Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Owner
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-blue-50 text-[10px] font-bold text-blue-700">
                                            {lead.user?.name
                                                .split(' ')
                                                .map((n: any) => n[0])
                                                .join('') || '?'}
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700">
                                            {lead.user?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Address
                                    </Label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                                        <span className="text-sm leading-relaxed text-neutral-700">
                                            {[
                                                lead.address,
                                                lead.city,
                                                lead.state,
                                                lead.country,
                                            ]
                                                .filter(Boolean)
                                                .join(', ') ||
                                                'No address provided'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Lead Source
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-neutral-400" />
                                        <span className="text-sm text-neutral-700">
                                            {lead.source || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog open={confirmConvert} onOpenChange={setConfirmConvert}>
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
