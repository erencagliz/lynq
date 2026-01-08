import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ClipboardList,
    Mail,
    Plus,
    Settings2,
    Sparkles,
    Trash2,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
    { title: 'Workflows', href: '/settings/workflows' },
    { title: 'Create', href: '/settings/workflows/create' },
];

const TRIGGERS = [
    { id: 'deal.created', label: 'Deal Created', icon: Zap },
    { id: 'deal.updated', label: 'Deal Updated', icon: Zap },
    { id: 'lead.created', label: 'Lead Created', icon: Zap },
    { id: 'lead.converted', label: 'Lead Converted', icon: Zap },
];

const ACTIONS = [
    {
        id: 'send_email',
        label: 'Send Email',
        icon: Mail,
        description: 'Send an automated email to a recipient.',
    },
    {
        id: 'create_task',
        label: 'Create Task',
        icon: ClipboardList,
        description: 'Assign a new task related to the event.',
    },
];

export default function Create() {
    const [selectedActions, setSelectedActions] = useState<any[]>([]);

    const { data, setData, post, processing, errors } = useForm<any>({
        name: '',
        trigger_event: '',
        conditions: [],
        actions: [],
        is_active: true,
    });

    const addAction = (type: string) => {
        const newAction = {
            id: Date.now(),
            type,
            params:
                type === 'send_email'
                    ? {
                          subject: 'Automated Notification: {deal_name}',
                          body: 'Hello,\n\nA new deal "{deal_name}" has been created.',
                      }
                    : { subject: 'Follow up on: {deal_name}' },
        };
        const updatedActions = [...selectedActions, newAction];
        setSelectedActions(updatedActions);
        setData(
            'actions',
            updatedActions.map((a) => ({ type: a.type, params: a.params })),
        );
    };

    const removeAction = (id: number) => {
        const updatedActions = selectedActions.filter((a) => a.id !== id);
        setSelectedActions(updatedActions);
        setData(
            'actions',
            updatedActions.map((a) => ({ type: a.type, params: a.params })),
        );
    };

    const updateActionParam = (id: number, key: string, value: string) => {
        const updatedActions = selectedActions.map((a) => {
            if (a.id === id) {
                return { ...a, params: { ...a.params, [key]: value } };
            }
            return a;
        });
        setSelectedActions(updatedActions);
        setData(
            'actions',
            updatedActions.map((a) => ({ type: a.type, params: a.params })),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/workflows');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Workflow" />
            <div className="mx-auto flex h-full w-full max-w-[800px] flex-1 flex-col gap-4 p-4 pb-20">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Create Workflow
                        </h1>
                        <p className="text-sm text-neutral-500 italic">
                            Automate your team's routine tasks.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/settings/workflows">Cancel</Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                processing ||
                                !data.name ||
                                !data.trigger_event ||
                                data.actions.length === 0
                            }
                            className="bg-emerald-600 shadow-lg shadow-emerald-200/50 hover:bg-emerald-700"
                        >
                            <Sparkles className="mr-2 h-4 w-4" /> Save Workflow
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <Card className="border-2 border-neutral-100 shadow-md">
                        <CardHeader className="border-b bg-neutral-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings2 className="h-5 w-5 text-neutral-400" />{' '}
                                General Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                >
                                    Workflow Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Notify team on new high-value deal"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-10 border-neutral-200 shadow-sm focus:border-blue-500"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <ArrowDown className="h-8 w-8 animate-bounce text-neutral-200" />
                    </div>

                    {/* Trigger Section */}
                    <Card className="border-2 border-amber-100 bg-amber-50/10 shadow-md">
                        <CardHeader className="border-b bg-amber-50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
                                <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />{' '}
                                Trigger Step
                            </CardTitle>
                            <CardDescription>
                                What event starts this automation?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-3">
                                {TRIGGERS.map((trigger) => (
                                    <div
                                        key={trigger.id}
                                        onClick={() =>
                                            setData('trigger_event', trigger.id)
                                        }
                                        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                                            data.trigger_event === trigger.id
                                                ? 'translate-y-0.5 border-amber-500 bg-amber-100/50 shadow-inner'
                                                : 'border-neutral-100 bg-white hover:border-amber-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div
                                            className={`rounded-full p-2 ${data.trigger_event === trigger.id ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500 transition-transform group-hover:scale-110'}`}
                                        >
                                            <trigger.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">
                                            {trigger.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {errors.trigger_event && (
                                <p className="mt-2 text-xs text-red-500">
                                    {errors.trigger_event}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <ArrowDown className="h-8 w-8 animate-bounce text-neutral-200" />
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-emerald-100 p-1.5">
                                    <Sparkles className="h-4 w-4 text-emerald-600" />
                                </div>
                                <h2 className="text-xs font-bold tracking-widest text-neutral-800 uppercase">
                                    Automated Actions
                                </h2>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 border-2 font-bold transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />{' '}
                                        Add Action
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuLabel>
                                        Choose an Action
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {ACTIONS.map((action) => (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => addAction(action.id)}
                                            className="flex cursor-pointer items-center py-2"
                                        >
                                            <action.icon className="mr-3 h-4 w-4 text-neutral-400" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">
                                                    {action.label}
                                                </span>
                                                <span className="line-clamp-1 text-[10px] text-neutral-500">
                                                    {action.description}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {selectedActions.length === 0 ? (
                            <Card className="border-2 border-dashed bg-neutral-50/50 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="rounded-full bg-neutral-100 p-3 text-neutral-400">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-500">
                                        No actions added yet.
                                        <br />
                                        Click "Add Action" to begin.
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {selectedActions.map((action, index) => (
                                    <Card
                                        key={action.id}
                                        className="group relative overflow-hidden border-2 border-emerald-100 shadow-sm"
                                    >
                                        <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500" />
                                        <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                                        {ACTIONS.find(
                                                            (a) =>
                                                                a.id ===
                                                                action.type,
                                                        )?.icon && (
                                                            <span className="text-emerald-600">
                                                                <Sparkles className="inline h-3 w-3" />
                                                            </span>
                                                        )}
                                                        {
                                                            ACTIONS.find(
                                                                (a) =>
                                                                    a.id ===
                                                                    action.type,
                                                            )?.label
                                                        }
                                                    </CardTitle>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeAction(action.id)
                                                }
                                                className="h-8 w-8 p-0 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-4">
                                            {action.type === 'send_email' && (
                                                <div className="grid gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold text-neutral-500 uppercase">
                                                            Subject
                                                        </Label>
                                                        <Input
                                                            value={
                                                                action.params
                                                                    .subject
                                                            }
                                                            onChange={(e) =>
                                                                updateActionParam(
                                                                    action.id,
                                                                    'subject',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-9 border-emerald-100 text-sm shadow-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold text-neutral-500 uppercase">
                                                            Body
                                                        </Label>
                                                        <Textarea
                                                            rows={3}
                                                            value={
                                                                action.params
                                                                    .body
                                                            }
                                                            onChange={(e) =>
                                                                updateActionParam(
                                                                    action.id,
                                                                    'body',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="min-h-[100px] border-emerald-100 text-sm shadow-none focus:border-emerald-500"
                                                        />
                                                        <p className="text-[10px] text-neutral-400">
                                                            Pro tip: Use{' '}
                                                            <code className="bg-neutral-100 px-1">
                                                                {'{deal_name}'}
                                                            </code>{' '}
                                                            as a placeholder.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {action.type === 'create_task' && (
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-neutral-500 uppercase">
                                                        Task Subject
                                                    </Label>
                                                    <Input
                                                        value={
                                                            action.params
                                                                .subject
                                                        }
                                                        onChange={(e) =>
                                                            updateActionParam(
                                                                action.id,
                                                                'subject',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-9 border-emerald-100 text-sm shadow-none focus:border-emerald-500"
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {errors.actions && (
                            <p className="text-xs text-red-500">
                                {errors.actions}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
