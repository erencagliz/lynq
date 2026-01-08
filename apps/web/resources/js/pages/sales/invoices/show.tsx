import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Task } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Activity as ActivityIcon,
    AlertTriangle,
    ArrowLeft,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    FileText as FileIcon,
    History,
    Mail,
    Plus,
    Trash2,
    User,
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    subject: string;
    status: string;
    total_amount: number;
    currency: string;
    due_date: string;
    notes: string;
    created_at: string;
    items: InvoiceItem[];
    quote?: { id: number; quote_number: string };
    account?: { id: number; name: string; address?: string };
    contact?: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
    };
    deal?: { id: number; name: string };
    tasks?: Task[];
    activities?: any[];
}

interface Props {
    invoice: Invoice;
    history_items?: any[];
}

export default function Show({ invoice, history_items = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '#' },
        { title: 'Invoices', href: '/invoices' },
        { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
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

    const markAsPaid = () => {
        if (confirm('Are you sure you want to mark this invoice as paid?')) {
            router.patch(`/invoices/${invoice.id}`, { status: 'Paid' });
        }
    };

    const taskColumns: ColumnDef<Task>[] = [
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <span
                    className={
                        row.original.status === 'Completed'
                            ? 'text-neutral-400 line-through'
                            : ''
                    }
                >
                    {row.original.subject}
                </span>
            ),
        },
        { accessorKey: 'status', header: 'Status' },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) =>
                row.original.due_date
                    ? format(new Date(row.original.due_date), 'MMM d, yyyy')
                    : '-',
        },
    ];

    const activityColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <span className="capitalize">{row.original.type}</span>
            ),
        },
        { accessorKey: 'description', header: 'Description' },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) =>
                format(new Date(row.original.created_at), 'MMM d, p'),
        },
    ];

    const isOverdue =
        invoice.status === 'Sent' && new Date(invoice.due_date) < new Date();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="mx-auto flex h-full w-full max-w-[1200px] flex-1 flex-col gap-6 p-6 pb-20">
                {/* Status Bar */}
                {isOverdue && (
                    <div className="flex animate-pulse items-center justify-center gap-2 rounded-2xl bg-rose-500 p-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-rose-200">
                        <AlertTriangle className="h-4 w-4" /> This invoice is
                        overdue
                    </div>
                )}

                {/* Actions Toolbar */}
                <div className="sticky top-2 z-20 flex items-center justify-between rounded-3xl border-2 border-neutral-100 bg-white/90 p-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="rounded-full"
                        >
                            <Link href="/invoices">
                                <ArrowLeft className="h-4 w-4 text-neutral-400" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tighter text-neutral-900 uppercase">
                                {invoice.invoice_number}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-[10px] font-black tracking-widest uppercase ${invoice.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}
                                >
                                    {invoice.status}
                                </span>
                                {invoice.quote && (
                                    <span className="text-[10px] font-bold text-neutral-400">
                                        Ref:{' '}
                                        <Link
                                            href={`/quotes/${invoice.quote.id}`}
                                            className="underline decoration-dotted hover:text-blue-500"
                                        >
                                            {invoice.quote.quote_number}
                                        </Link>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 font-bold"
                        >
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 font-bold"
                        >
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        {invoice.status !== 'Paid' && (
                            <Button
                                onClick={markAsPaid}
                                className="rounded-xl bg-emerald-600 px-8 font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700"
                            >
                                <CreditCard className="mr-2 h-4 w-4" /> Mark as
                                Paid
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Invoice Document */}
                    <div className="col-span-12 lg:col-span-9">
                        <Card className="relative flex min-h-[1000px] flex-col overflow-hidden rounded-[3.5rem] border-0 bg-white shadow-2xl">
                            {/* Watermark */}
                            {invoice.status === 'Paid' && (
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-5">
                                    <div className="rounded-[3rem] border-[20px] border-emerald-600 px-24 py-12 text-center text-9xl font-black tracking-tighter text-emerald-600 uppercase">
                                        PAID
                                    </div>
                                </div>
                            )}

                            {/* Banner Color */}
                            <div
                                className={`h-8 w-full ${invoice.status === 'Paid' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-400'}`}
                            ></div>

                            <div className="flex items-start justify-between p-16">
                                <div className="space-y-8 text-left">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-900 text-3xl font-black text-white shadow-2xl">
                                        L
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h2 className="text-[10px] font-black tracking-[0.3em] text-neutral-400 uppercase">
                                                Bill To
                                            </h2>
                                            <div className="text-3xl leading-tight font-black text-neutral-900">
                                                {invoice.account ? (
                                                    <Link
                                                        href={`/accounts/${invoice.account.id}`}
                                                        className="transition-colors hover:text-blue-600"
                                                    >
                                                        {invoice.account.name}
                                                    </Link>
                                                ) : (
                                                    'Individual Client'
                                                )}
                                            </div>
                                            {invoice.contact && (
                                                <Link
                                                    href={`/contacts/${invoice.contact.id}`}
                                                    className="block text-lg font-bold text-neutral-500 transition-colors hover:text-blue-600"
                                                >
                                                    {invoice.contact.first_name}{' '}
                                                    {invoice.contact.last_name}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="max-w-xs text-sm font-medium text-neutral-400">
                                            {invoice.account?.address ||
                                                '123 Business Way, Software Valley, CA 94043'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-12 text-right">
                                    <h2 className="text-7xl leading-none font-black tracking-tighter text-neutral-900 uppercase opacity-10">
                                        INVOICE
                                    </h2>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs">
                                        <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Date Issued
                                        </div>
                                        <div className="font-black text-neutral-900">
                                            {format(
                                                new Date(invoice.created_at),
                                                'MMM d, yyyy',
                                            )}
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Terms
                                        </div>
                                        <div className="font-black text-neutral-900">
                                            Net 30
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Invoice Total
                                        </div>
                                        <div className="font-black text-neutral-900 italic">
                                            {invoice.total_amount.toFixed(2)}{' '}
                                            {invoice.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 px-16">
                                <div className="rounded-[2.5rem] border border-neutral-100 bg-neutral-50 p-8">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-200">
                                                <th className="px-4 py-4 text-left text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                    Work / Service Description
                                                </th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-4 text-right text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                    Rate
                                                </th>
                                                <th className="px-4 py-4 text-right text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {invoice.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-6">
                                                        <div className="font-bold text-neutral-800">
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-6 text-center font-black text-neutral-500">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-6 text-right font-medium text-neutral-400">
                                                        {item.unit_price.toFixed(
                                                            2,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-6 text-right font-black text-neutral-900">
                                                        {item.subtotal.toFixed(
                                                            2,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-end justify-between p-16 pb-24">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Payment Instructions
                                        </h4>
                                        <p className="max-w-sm text-xs leading-relaxed font-medium whitespace-pre-wrap text-neutral-500">
                                            {invoice.notes ||
                                                'Please make payment within the due date to avoid service interruption. Payments can be made via Bank Transfer or online portal. Account Number: 1234-5678-9900'}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-neutral-100 opacity-50 grayscale">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-neutral-100 text-[10px] font-black opacity-50 grayscale">
                                            VISA
                                        </div>
                                        <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-neutral-100 text-[10px] font-black opacity-50 grayscale">
                                            STRIPE
                                        </div>
                                    </div>
                                </div>
                                <div className="w-[340px] space-y-4">
                                    <div className="flex items-center justify-between px-4 text-sm">
                                        <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                                            Subtotal (Excl. Tax)
                                        </span>
                                        <span className="font-black text-neutral-900">
                                            {invoice.total_amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-px w-full bg-neutral-100"></div>
                                    <div
                                        className={`flex flex-col items-center justify-center gap-2 rounded-[2.5rem] p-8 shadow-2xl ${invoice.status === 'Paid' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-neutral-900 text-white'}`}
                                    >
                                        <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-60">
                                            Balance Due
                                        </span>
                                        <span className="text-6xl leading-none font-black tracking-tighter">
                                            {invoice.status === 'Paid'
                                                ? '0.00'
                                                : invoice.total_amount.toFixed(
                                                      2,
                                                  )}
                                        </span>
                                        <span className="text-xs font-black tracking-widest uppercase opacity-40">
                                            {invoice.currency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 space-y-6 lg:col-span-3">
                        <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-lg">
                            <CardContent className="space-y-8 p-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                        Payment Status
                                    </Label>
                                    <div
                                        className={`flex items-center gap-2 rounded-2xl border-2 p-4 text-xs font-black tracking-tight uppercase ${
                                            invoice.status === 'Paid'
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                                : isOverdue
                                                  ? 'border-rose-100 bg-rose-50 text-rose-700'
                                                  : 'border-amber-100 bg-amber-50 text-amber-900'
                                        }`}
                                    >
                                        {invoice.status === 'Paid' ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Clock className="h-4 w-4" />
                                        )}
                                        {invoice.status === 'Paid'
                                            ? 'Fulfilled / Paid'
                                            : isOverdue
                                              ? 'CRITICAL / OVERDUE'
                                              : 'Payment Pending'}
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-neutral-50 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
                                            <Calendar className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] leading-none font-black tracking-widest text-neutral-400 uppercase">
                                                Due Date
                                            </span>
                                            <span
                                                className={`mt-1 text-sm font-black ${isOverdue ? 'text-rose-600' : 'text-neutral-900'}`}
                                            >
                                                {format(
                                                    new Date(invoice.due_date),
                                                    'MMM d, yyyy',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
                                            <User className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] leading-none font-black tracking-widest text-neutral-400 uppercase">
                                                Contact
                                            </span>
                                            <span className="mt-1 text-sm font-black text-neutral-900">
                                                {invoice.contact ? (
                                                    <Link
                                                        href={`/contacts/${invoice.contact.id}`}
                                                        className="tracking-tight uppercase transition-colors hover:text-blue-600"
                                                    >
                                                        {
                                                            invoice.contact
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            invoice.contact
                                                                .last_name
                                                        }
                                                    </Link>
                                                ) : (
                                                    'Individual'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {invoice.deal && (
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
                                                <Briefcase className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] leading-none font-black tracking-widest text-neutral-400 uppercase">
                                                    Related Deal
                                                </span>
                                                <Link
                                                    href={`/deals/${invoice.deal.id}`}
                                                    className="mt-1 text-sm font-black tracking-tight text-neutral-900 uppercase transition-colors hover:text-blue-600"
                                                >
                                                    {invoice.deal.name}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8">
                                    <Button
                                        variant="outline"
                                        className="h-12 w-full rounded-2xl border-2 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-neutral-50"
                                    >
                                        Resend Notification
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs Section for Related Data */}
                <div className="mt-8">
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="h-11 w-full max-w-md rounded-2xl border-2 border-neutral-100 bg-white/50 p-1 shadow-sm">
                            <TabsTrigger
                                value="activity"
                                className="flex items-center gap-2 rounded-xl p-2 px-4 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-md"
                            >
                                <ActivityIcon className="h-3.5 w-3.5" />{' '}
                                Activity
                            </TabsTrigger>
                            <TabsTrigger
                                value="tasks"
                                className="flex items-center gap-2 rounded-xl p-2 px-4 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-md"
                            >
                                <Plus className="h-3.5 w-3.5" /> Tasks
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex items-center gap-2 rounded-xl p-2 px-4 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-md"
                            >
                                <History className="h-3.5 w-3.5" /> History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="activity"
                            className="mt-6 space-y-4"
                        >
                            <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-xl">
                                <div className="flex h-12 items-center justify-between border-b bg-neutral-50/50 px-8">
                                    <h2 className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase">
                                        <FileIcon className="h-4 w-4" /> Recent
                                        Activities (
                                        {(invoice.activities || []).length})
                                    </h2>
                                </div>
                                <div className="p-8">
                                    <DataTable
                                        columns={activityColumns}
                                        data={invoice.activities || []}
                                        placeholder="Search activities..."
                                    />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tasks" className="mt-6">
                            <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-xl">
                                <div className="flex h-12 items-center justify-between border-b bg-neutral-50/50 px-8">
                                    <h2 className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase">
                                        <Calendar className="h-4 w-4" /> Tasks (
                                        {invoice.tasks?.length || 0})
                                    </h2>
                                </div>
                                <div className="p-8">
                                    <DataTable
                                        columns={taskColumns}
                                        data={invoice.tasks || []}
                                        placeholder="Search tasks..."
                                    />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-6">
                            <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-xl">
                                <div className="flex h-12 items-center justify-between border-b bg-neutral-50/50 px-8">
                                    <h2 className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase">
                                        <History className="h-4 w-4" /> Audit
                                        History
                                    </h2>
                                </div>
                                <div className="divide-y divide-neutral-50">
                                    {processedLogs.length > 0 ? (
                                        processedLogs.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-6 transition-colors hover:bg-neutral-50/50"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={cn(
                                                            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 shadow-sm',
                                                            item.is_deleted_event
                                                                ? 'border-rose-100 bg-rose-50 text-rose-600'
                                                                : 'border-indigo-100 bg-indigo-50 text-indigo-600',
                                                        )}
                                                    >
                                                        {item.is_deleted_event ? (
                                                            <Trash2 className="h-4 w-4" />
                                                        ) : (
                                                            <History className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-1.5">
                                                        <p className="text-sm leading-tight font-black tracking-tight text-neutral-900">
                                                            {item.action}
                                                        </p>
                                                        {item.new_values && (
                                                            <div className="mt-3 space-y-2 border-l-4 border-neutral-100 py-1 pl-4 text-[11px]">
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
                                                                            <span className="w-24 shrink-0 text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                                                                                {key.replace(
                                                                                    '_',
                                                                                    ' ',
                                                                                )}
                                                                                :
                                                                            </span>
                                                                            <span className="truncate font-bold text-emerald-600">
                                                                                {String(
                                                                                    val ||
                                                                                        'None',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="mt-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                            {item.user} •{' '}
                                                            {format(
                                                                new Date(
                                                                    item.date,
                                                                ),
                                                                'MMM d, p',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-sm font-medium text-neutral-300 italic">
                                            No history found for this invoice.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
