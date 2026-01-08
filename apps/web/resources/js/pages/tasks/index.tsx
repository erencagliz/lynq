import { DataTable } from '@/components/data-table';
import { KanbanBoard, KanbanColumnData } from '@/components/kanban/board';
import { KanbanItem } from '@/components/kanban/item';
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
import { BreadcrumbItem, Task, User } from '@/types';
import { DropResult } from '@hello-pangea/dnd';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Eye,
    LayoutGrid,
    List,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

import FilterBar from '@/components/filters/filter-bar';
import SearchInput from '@/components/filters/search-input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

interface Props {
    tasks: {
        data: Task[];
        current_page: number;
        last_page: number;
        total: number;
        path: string;
        per_page: number;
    };
    filters: any;
    users: User[];
}

export default function Index({ tasks, filters, users }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

    const columns: ColumnDef<Task>[] = [
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
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <Link
                    href={`/tasks/${row.original.id}`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {row.getValue('subject')}
                </Link>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue('status')}</Badge>
            ),
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => {
                const priority = row.getValue('priority') as string;
                let color = 'text-neutral-500';
                if (priority === 'High') color = 'text-red-600';
                if (priority === 'Normal') color = 'text-orange-500';
                return (
                    <span className={`text-xs font-medium ${color}`}>
                        {priority}
                    </span>
                );
            },
        },
        {
            accessorKey: 'assignee',
            header: 'Assignee',
            cell: ({ row }) => {
                const assignee = row.original.assignee;
                return assignee ? (
                    <UserInfo user={assignee} />
                ) : (
                    <span className="text-sm text-neutral-400">Unassigned</span>
                );
            },
        },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) => {
                const date = row.getValue('due_date') as string;
                return date ? (
                    <span className="text-sm text-neutral-600">
                        {format(new Date(date), 'MMM d, yyyy')}
                    </span>
                ) : (
                    '-'
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="mr-2 h-4 w-4 text-neutral-500" />{' '}
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/tasks/${task.id}/edit`}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="mr-2 h-4 w-4 text-neutral-500" />{' '}
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.delete(`/tasks/${task.id}`)
                                    }
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const boardColumns: KanbanColumnData[] = [
        { id: 'Todo', title: 'To Do' },
        { id: 'In Progress', title: 'In Progress' },
        { id: 'Done', title: 'Done' },
    ];

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        )
            return;

        const taskId = draggableId;
        const newStatus = destination.droppableId;

        // Optimistic update could go here, but for now we rely on Inertia reload
        router.post(
            `/tasks/${taskId}/update-status`,
            { status: newStatus },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-neutral-500" />
                        <h1 className="text-2xl font-semibold">Tasks</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-md border bg-neutral-100 p-1">
                            <Button
                                variant={
                                    viewMode === 'board' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => setViewMode('board')}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Board
                            </Button>
                            <Button
                                variant={
                                    viewMode === 'list' ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="mr-2 h-4 w-4" />
                                List
                            </Button>
                        </div>
                        <SearchInput defaultValue={filters.search} />
                        <FilterBar
                            filters={filters}
                            columns={[
                                { label: 'Subject', value: 'subject' },
                                { label: 'Status', value: 'status' },
                                { label: 'Priority', value: 'priority' },
                            ]}
                        />
                        <Button asChild>
                            <Link href="/tasks/create">
                                <Plus className="mr-2 h-4 w-4" /> New Task
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={tasks.data}
                        meta={{
                            current_page: tasks.current_page,
                            last_page: tasks.last_page,
                            total: tasks.total,
                            path: tasks.path,
                            per_page: tasks.per_page,
                        }}
                        filters={filters}
                        placeholder="Search tasks..."
                        hideToolbar={true}
                    />
                ) : (
                    <KanbanBoard
                        columns={boardColumns}
                        items={tasks.data}
                        groupBy={(task) => task.status}
                        onDragEnd={onDragEnd}
                        renderItem={(task: Task) => (
                            <KanbanItem className="flex flex-col gap-2">
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="line-clamp-2 text-sm font-medium text-neutral-900">
                                            {task.subject}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`px-1.5 py-0 text-[10px] ${
                                                task.priority === 'High'
                                                    ? 'border-red-200 bg-red-50 text-red-600'
                                                    : task.priority === 'Normal'
                                                      ? 'border-orange-200 bg-orange-50 text-orange-600'
                                                      : 'text-neutral-500'
                                            }`}
                                        >
                                            {task.priority}
                                        </Badge>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2">
                                        <div className="flex items-center gap-2">
                                            {task.assignee ? (
                                                <UserInfo
                                                    user={task.assignee}
                                                    showName={false}
                                                    className="h-5 w-5"
                                                />
                                            ) : (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
                                                    <UserIcon className="h-3 w-3 text-neutral-400" />
                                                </div>
                                            )}
                                        </div>
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(
                                                    new Date(task.due_date),
                                                    'MMM d',
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </KanbanItem>
                        )}
                    />
                )}
            </div>
        </AppLayout>
    );
}
