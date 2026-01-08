import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Task, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    Circle,
    Clock,
    Edit2,
    FileText,
    History,
    Link as LinkIcon,
    Tag,
    Trash2,
    TrendingUp,
} from 'lucide-react';

interface Props {
    task: Task & {
        assignee?: User;
        creator?: User;
        taskable?: any;
    };
    history_items?: any[];
}

export default function Show({ task, history_items = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tasks', href: '/tasks' },
        { title: task.subject, href: `/tasks/${task.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${task.id}`);
        }
    };

    const toggleStatus = () => {
        const nextStatus =
            task.status === 'Completed' ? 'Pending' : 'Completed';
        router.patch(
            `/tasks/${task.id}/status`,
            { status: nextStatus },
            {
                preserveScroll: true,
            },
        );
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'Medium':
                return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'Low':
                return 'bg-green-50 text-green-700 border-green-100';
            default:
                return 'bg-neutral-50 text-neutral-700 border-neutral-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case 'Deferred':
                return <Clock className="h-5 w-5 text-amber-500" />;
            default:
                return <Circle className="h-5 w-5 text-neutral-300" />;
        }
    };

    const getTaskableLink = (taskable: any) => {
        if (!taskable) return null;
        const type = task.taskable_type?.split('\\').pop()?.toLowerCase();
        let path = '';
        switch (type) {
            case 'account':
                path = `/accounts/${taskable.id}`;
                break;
            case 'contact':
                path = `/contacts/${taskable.id}`;
                break;
            case 'lead':
                path = `/leads/${taskable.id}`;
                break;
            case 'deal':
                path = `/deals/${taskable.id}`;
                break;
            default:
                return (
                    <span>
                        {taskable.name || taskable.subject || 'Related Record'}
                    </span>
                );
        }
        return (
            <Link
                href={path}
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
            >
                <LinkIcon className="h-3 w-3" />
                {taskable.name ||
                    taskable.subject ||
                    taskable.first_name + ' ' + taskable.last_name}
            </Link>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={task.subject} />

            <div className="mx-auto min-h-screen w-full max-w-[1200px] space-y-4 bg-neutral-100/40 p-4">
                {/* Header Highlights Panel */}
                <div className="rounded border bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleStatus}
                                className="group transition-transform active:scale-95"
                                title="Toggle Status"
                            >
                                {getStatusIcon(task.status)}
                            </button>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Task
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1
                                        className={cn(
                                            'text-xl font-bold text-neutral-900',
                                            task.status === 'Completed' &&
                                                'text-neutral-400 line-through',
                                        )}
                                    >
                                        {task.subject}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'h-5 px-1.5 text-[10px] font-bold tracking-wider uppercase',
                                            getPriorityColor(task.priority),
                                        )}
                                    >
                                        {task.priority || 'No Priority'}
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
                                <Link href={`/tasks/${task.id}/edit`}>
                                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />{' '}
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-y-4 divide-x divide-neutral-100 px-5 py-3 md:grid-cols-4">
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Status
                            </Label>
                            <p className="text-sm font-bold text-neutral-900">
                                {task.status}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Due Date
                            </Label>
                            <p
                                className={cn(
                                    'truncate text-sm font-semibold',
                                    task.due_date &&
                                        new Date(task.due_date) < new Date() &&
                                        task.status !== 'Completed'
                                        ? 'text-red-600'
                                        : 'text-neutral-700',
                                )}
                            >
                                {task.due_date
                                    ? format(
                                          new Date(task.due_date),
                                          'MMM d, yyyy',
                                      )
                                    : 'No Due Date'}
                            </p>
                        </div>
                        <div className="space-y-1 border-l-0 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Assignee
                            </Label>
                            <div className="flex items-center justify-center gap-1.5">
                                {task.assignee ? (
                                    <>
                                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[8px] font-bold text-blue-700">
                                            {task.assignee.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <span className="truncate text-sm font-semibold text-neutral-700">
                                            {task.assignee.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm font-semibold text-neutral-400">
                                        —
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 px-4 text-center">
                            <Label className="text-[11px] font-medium tracking-tight text-neutral-500 uppercase">
                                Created
                            </Label>
                            <p className="truncate text-sm font-semibold text-neutral-600">
                                {format(
                                    new Date(task.created_at),
                                    'MMM d, yyyy',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="h-11 w-full max-w-xs rounded-xl border bg-neutral-100/50 p-1">
                                <TabsTrigger
                                    value="details"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <FileText className="h-4 w-4" /> Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <History className="h-4 w-4" /> History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="mt-4">
                                <Card className="shadow-sm">
                                    <CardHeader className="border-b bg-neutral-50/50 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                                            <FileText className="h-3.5 w-3.5" />{' '}
                                            Description
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {task.description ? (
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">
                                                {task.description}
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-neutral-400 italic">
                                                No description provided for this
                                                task.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="mt-4">
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
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        {/* Related Records Card */}
                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader className="border-b bg-neutral-50/50 pb-3">
                                <CardTitle className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                                    <LinkIcon className="h-3.5 w-3.5" />{' '}
                                    Relationships
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Related To
                                    </Label>
                                    <div className="flex min-h-[32px] items-center gap-2">
                                        {task.taskable ? (
                                            getTaskableLink(task.taskable)
                                        ) : (
                                            <span className="text-sm text-neutral-400 italic">
                                                None
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5 border-t border-neutral-50 pt-2">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Created By
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-neutral-100 text-[10px] font-bold text-neutral-600">
                                            {task.creator?.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('') || '?'}
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700">
                                            {task.creator?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 border-t border-neutral-50 pt-2">
                                    <Label className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                        Type
                                    </Label>
                                    <div className="flex items-center gap-2 text-sm font-medium tracking-wide text-neutral-700 uppercase">
                                        <Tag className="h-3.5 w-3.5 text-neutral-400" />
                                        {task.type || 'Standard'}
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
