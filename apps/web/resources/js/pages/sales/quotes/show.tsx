import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Task } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Activity as ActivityIcon,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    FileText as FileIcon,
    History,
    Plus,
    Printer,
    Share2,
    Trash2,
    User,
} from 'lucide-react';

interface QuoteItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Quote {
    id: number;
    quote_number: string;
    subject: string;
    status: string;
    total_amount: number;
    currency: string;
    valid_until: string;
    notes: string;
    created_at: string;
    items: QuoteItem[];
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
    quote: Quote;
    history_items?: any[];
}

export default function Show({ quote, history_items = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sales', href: '#' },
        { title: 'Quotes', href: '/quotes' },
        { title: quote.quote_number, href: `/quotes/${quote.id}` },
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

    const convertToInvoice = () => {
        if (confirm('Convert this quote to an active invoice?')) {
            router.get(`/invoices/create?quote_id=${quote.id}`);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quote ${quote.quote_number}`} />
            <div className="mx-auto flex h-full w-full max-w-[1200px] flex-1 flex-col gap-6 p-6 pb-20">
                {/* Actions Toolbar */}
                <div className="sticky top-2 z-20 flex items-center justify-between rounded-3xl border bg-white/80 p-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="rounded-full"
                        >
                            <Link href="/quotes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tighter text-neutral-900 uppercase">
                                {quote.quote_number}
                            </h1>
                            <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">
                                {quote.status} QUOTATION
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 font-bold"
                        >
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 font-bold"
                        >
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button
                            onClick={convertToInvoice}
                            className="rounded-xl bg-neutral-900 px-6 font-bold shadow-xl shadow-neutral-200 hover:bg-neutral-800"
                        >
                            Convert to Invoice{' '}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Document Area */}
                    <div className="col-span-12 lg:col-span-9">
                        <Card className="flex min-h-[1000px] flex-col overflow-hidden rounded-[3rem] border-0 bg-white shadow-2xl">
                            {/* Document Header */}
                            <div className="flex items-start justify-between border-b-8 border-blue-600 bg-neutral-50/50 p-16">
                                <div className="space-y-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-xl shadow-blue-200">
                                        L
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-black tracking-[0.3em] text-neutral-400 uppercase">
                                            Bill To
                                        </h2>
                                        <div className="text-2xl font-black text-neutral-900">
                                            {quote.account ? (
                                                <Link
                                                    href={`/accounts/${quote.account.id}`}
                                                    className="transition-colors hover:text-blue-600"
                                                >
                                                    {quote.account.name}
                                                </Link>
                                            ) : (
                                                'Individual Client'
                                            )}
                                        </div>
                                        {quote.contact && (
                                            <Link
                                                href={`/contacts/${quote.contact.id}`}
                                                className="block font-bold text-neutral-500 transition-colors hover:text-blue-600"
                                            >
                                                {quote.contact.first_name}{' '}
                                                {quote.contact.last_name}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-8 text-right">
                                    <div className="py-4 text-6xl font-black tracking-tighter text-neutral-900 uppercase opacity-10 select-none">
                                        QUOTATION
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                                        <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Date Issued
                                        </div>
                                        <div className="font-bold text-neutral-900">
                                            {format(
                                                new Date(quote.created_at),
                                                'MMMM d, yyyy',
                                            )}
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Valid Until
                                        </div>
                                        <div className="font-bold text-neutral-900">
                                            {quote.valid_until
                                                ? format(
                                                      new Date(
                                                          quote.valid_until,
                                                      ),
                                                      'MMMM d, yyyy',
                                                  )
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item Table */}
                            <div className="flex-1 p-16">
                                <h3 className="mb-8 pl-1 text-[10px] font-black tracking-[0.5em] text-blue-600 uppercase">
                                    Description of items / services
                                </h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-neutral-100">
                                            <th className="w-12 py-4 pl-4 text-left text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                #
                                            </th>
                                            <th className="px-4 py-4 text-left text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                Item & Description
                                            </th>
                                            <th className="w-24 px-4 py-4 text-center text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                Qty
                                            </th>
                                            <th className="w-32 px-4 py-4 text-right text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                Unit Price
                                            </th>
                                            <th className="w-32 py-4 pr-4 text-right text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {quote.items.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="group transition-colors hover:bg-neutral-50/50"
                                            >
                                                <td className="py-6 pl-4 text-xs font-black text-neutral-300">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="font-bold text-neutral-900">
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6 text-center font-black text-neutral-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-6 text-right font-bold text-neutral-500">
                                                    {new Intl.NumberFormat(
                                                        'en-US',
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    ).format(item.unit_price)}
                                                </td>
                                                <td className="py-6 pr-4 text-right font-black text-neutral-900">
                                                    {new Intl.NumberFormat(
                                                        'en-US',
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    ).format(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer / Totals */}
                            <div className="mt-auto bg-neutral-50/30 p-16 pt-0">
                                <div className="grid grid-cols-2 gap-16 border-t pt-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Terms & Conditions
                                        </h4>
                                        <p className="pr-12 text-sm leading-relaxed text-neutral-500 italic">
                                            {quote.notes ||
                                                'This quotation is valid for 30 days. All prices are subject to change after the validity period. Quality and satisfaction guaranteed by Lynq CRM Systems.'}
                                        </p>
                                    </div>
                                    <div className="space-y-4 rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-xl shadow-neutral-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                                                Subtotal
                                            </span>
                                            <span className="font-bold text-neutral-900">
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency:
                                                            quote.currency,
                                                    },
                                                ).format(quote.total_amount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                                                Discount
                                            </span>
                                            <span className="font-bold text-emerald-600">
                                                -$0.00
                                            </span>
                                        </div>
                                        <div className="my-4 h-px bg-neutral-100"></div>
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">
                                                    Total Amount
                                                </span>
                                                <span className="text-xs font-bold tracking-tighter text-neutral-400 uppercase italic">
                                                    Subject to Taxes
                                                </span>
                                            </div>
                                            <span className="text-4xl font-black tracking-tighter text-neutral-900">
                                                {quote.total_amount.toFixed(2)}{' '}
                                                <span className="text-xs font-black uppercase">
                                                    {quote.currency}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar / Info Card */}
                    <div className="col-span-12 space-y-6 lg:col-span-3">
                        <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-xl">
                            <CardContent className="space-y-6 p-6 text-center">
                                <div
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-sm ${
                                        quote.status === 'Accepted'
                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                            : quote.status === 'Draft'
                                              ? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                              : 'border-blue-100 bg-blue-50 text-blue-700'
                                    }`}
                                >
                                    {quote.status === 'Accepted' ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <Clock className="h-3 w-3" />
                                    )}
                                    {quote.status} Status
                                </div>

                                <div className="space-y-4 border-t border-neutral-50 pt-4 text-left">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Client Contact
                                        </span>
                                        {quote.contact ? (
                                            <Link
                                                href={`/contacts/${quote.contact.id}`}
                                                className="flex items-center gap-2 font-bold tracking-tight text-neutral-800 hover:text-blue-600"
                                            >
                                                <User className="h-4 w-4 text-neutral-300" />
                                                {quote.contact.first_name}{' '}
                                                {quote.contact.last_name}
                                            </Link>
                                        ) : (
                                            <div className="text-sm text-neutral-300 italic">
                                                No contact assigned
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Related Deal
                                        </span>
                                        {quote.deal ? (
                                            <Link
                                                href={`/deals/${quote.deal.id}`}
                                                className="flex items-center gap-2 font-bold tracking-tight text-neutral-800 hover:text-blue-600"
                                            >
                                                <Briefcase className="h-4 w-4 text-neutral-300" />
                                                {quote.deal.name}
                                            </Link>
                                        ) : (
                                            <div className="text-sm text-neutral-300 italic">
                                                No deal linked
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                            Expiration
                                        </span>
                                        <div className="flex items-center gap-2 font-bold tracking-tight text-neutral-800">
                                            <Calendar className="h-4 w-4 text-neutral-300" />
                                            {quote.valid_until
                                                ? format(
                                                      new Date(
                                                          quote.valid_until,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : 'No date set'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-6">
                                    <Button
                                        variant="outline"
                                        className="h-10 w-full rounded-xl border-2 text-xs font-bold"
                                    >
                                        <Copy className="mr-2 h-3.5 w-3.5" />{' '}
                                        Clone
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 w-full rounded-xl border-2 text-xs font-bold"
                                    >
                                        <Share2 className="mr-2 h-3.5 w-3.5" />{' '}
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs Section for Related Data */}
                <div className="mt-8">
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="h-11 w-full max-w-md rounded-xl border bg-white/50 p-1">
                            <TabsTrigger
                                value="activity"
                                className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <ActivityIcon className="h-4 w-4" /> Activity
                            </TabsTrigger>
                            <TabsTrigger
                                value="tasks"
                                className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <Plus className="h-4 w-4" /> Tasks
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="flex items-center gap-2 rounded-lg p-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <History className="h-4 w-4" /> History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="activity"
                            className="mt-4 space-y-4"
                        >
                            <div className="overflow-hidden rounded border bg-white shadow-sm">
                                <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                    <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                        <FileIcon className="h-4 w-4 text-neutral-400" />{' '}
                                        Recent Activities (
                                        {(quote.activities || []).length})
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        columns={activityColumns}
                                        data={quote.activities || []}
                                        placeholder="Search activities..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="mt-4">
                            <div className="overflow-hidden rounded border bg-white shadow-sm">
                                <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                    <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                        <Calendar className="h-4 w-4 text-neutral-400" />{' '}
                                        Tasks ({quote.tasks?.length || 0})
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <DataTable
                                        columns={taskColumns}
                                        data={quote.tasks || []}
                                        placeholder="Search tasks..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <div className="overflow-hidden rounded border bg-white shadow-sm">
                                <div className="flex h-10 items-center justify-between border-b bg-neutral-50/50 px-4">
                                    <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                                        <History className="h-4 w-4 text-neutral-400" />{' '}
                                        Audit History
                                    </h2>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {processedLogs.length > 0 ? (
                                        processedLogs.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 transition-colors hover:bg-neutral-50"
                                            >
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
                                                            {item.action}
                                                        </p>
                                                        {item.new_values && (
                                                            <div className="mt-2 space-y-1 border-l-2 border-neutral-100 py-1 pl-3 text-[11px]">
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
                                                                            <span className="truncate font-semibold text-green-600">
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
                                                        <div className="mt-1 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
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
                                        <div className="p-8 text-center text-xs text-neutral-400 italic">
                                            No history found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
