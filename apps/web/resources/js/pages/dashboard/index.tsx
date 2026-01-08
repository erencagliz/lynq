import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Deal, Task } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Activity as ActivityIcon,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Building2,
    CheckCircle2,
    ChevronRight,
    DollarSign,
    FileText,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardMetrics {
    totalRevenue: number;
    revenueGrowth: number;
    activeDeals: number;
    activeDealsGrowth: number;
    conversionRate: number;
    conversionRateChange: number;
    totalAccounts: number;
    accountsGrowth: number;
    totalContacts: number;
    wonDeals: number;
    velocityGrowth: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface DealByStage {
    stage: string;
    count: number;
    value: number;
}

interface TopAccount {
    id: number;
    name: string;
    total_value: number;
}

interface FeedItem {
    id: number;
    type: 'activity' | 'audit';
    action: string;
    description: string;
    user: string;
    date: string;
}

interface Props {
    metrics: DashboardMetrics;
    monthlyRevenue: MonthlyRevenue[];
    dealsByStage: DealByStage[];
    topAccounts: TopAccount[];
    recentDeals: Deal[];
    pendingTasks: Task[];
    upcomingTasks: Task[];
    activityFeed: FeedItem[];
}

export default function Dashboard({
    metrics,
    monthlyRevenue,
    dealsByStage,
    topAccounts,
    recentDeals,
    pendingTasks,
    upcomingTasks = [],
    activityFeed = [],
}: Props) {
    // ... existing code ...

    // (Inside the return JSX, inside the Tasks Card div)
    {
        /* Tasks Card */
    }
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-neutral-900 p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
        <div className="relative z-10 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xs font-black tracking-[0.3em] text-neutral-500 uppercase">
                        Actions
                    </h3>
                    <p className="text-xl font-black tracking-tighter">
                        Your To-Do List
                    </p>
                </div>
            </div>
            <div className="text-2xl font-black text-indigo-500">
                {pendingTasks.length}
            </div>
        </div>

        <div className="relative z-10 space-y-4">
            {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => {
                    const isOverdue =
                        task.due_date && new Date(task.due_date) < new Date();
                    return (
                        <div
                            key={task.id}
                            className="group/task flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
                        >
                            <div className="min-w-0 flex-1">
                                <p
                                    className={cn(
                                        'truncate text-xs font-black tracking-tight uppercase transition-colors',
                                        isOverdue
                                            ? 'text-red-400'
                                            : 'group-hover/task:text-indigo-400',
                                    )}
                                >
                                    {task.subject}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    {isOverdue && (
                                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black text-red-400 uppercase">
                                            Overdue
                                        </span>
                                    )}
                                    <p className="text-[10px] font-bold tracking-tighter text-neutral-500 uppercase">
                                        Due{' '}
                                        {task.due_date
                                            ? format(
                                                new Date(task.due_date),
                                                'MMM d',
                                            )
                                            : 'No Date'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/tasks/${task.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 opacity-0 transition-opacity group-hover/task:opacity-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    );
                })
            ) : (
                <div className="py-8 text-center text-sm font-medium text-neutral-500 italic">
                    You're all caught up!
                </div>
            )}
        </div>
    </div>;
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const metricCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(metrics.totalRevenue),
            icon: DollarSign,
            trend: metrics.revenueGrowth,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Active Deals',
            value: metrics.activeDeals.toString(),
            icon: TrendingUp,
            trend: metrics.activeDealsGrowth,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            icon: CheckCircle2,
            trend: metrics.conversionRateChange,
            color: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-500/10',
        },
        {
            title: 'Total Accounts',
            value: metrics.totalAccounts.toString(),
            icon: Building2,
            trend: metrics.accountsGrowth,
            color: 'from-orange-500 to-rose-600',
            bg: 'bg-orange-500/10',
        },
    ];

    const quickActions = [
        {
            title: 'New Deal',
            href: '/deals/create',
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'New Task',
            href: '/tasks/create',
            icon: FileText,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            title: 'Add Contact',
            href: '/contacts/create',
            icon: UserPlus,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            title: 'New Account',
            href: '/accounts/create',
            icon: Building2,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
    ];

    const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl border border-neutral-200 bg-white/90 p-3 shadow-xl backdrop-blur-md">
                    <p className="mb-1 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                        {label}
                    </p>
                    <p className="text-sm font-black text-neutral-900">
                        {prefix}
                        {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto flex h-full w-full max-w-[1600px] flex-1 flex-col gap-6 bg-neutral-50/30 p-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-neutral-900 uppercase italic select-none">
                            Overview<span className="text-blue-600">.</span>
                        </h1>
                        <p className="text-sm font-bold tracking-tight text-neutral-400 uppercase">
                            Performance & Velocity Metrics
                        </p>
                    </div>

                    {/* Quick Action Center */}
                    <div className="flex items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-sm">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className={cn(
                                    'group flex flex-col items-center justify-center rounded-xl p-2 transition-all hover:scale-105 active:scale-95',
                                    action.bg,
                                )}
                            >
                                <action.icon
                                    className={cn(
                                        'mb-1 h-5 w-5 transition-colors',
                                        action.color,
                                    )}
                                />
                                <span className="text-[9px] font-black tracking-tighter text-neutral-500 uppercase group-hover:text-neutral-900">
                                    {action.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Glass Metrics Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {metricCards.map((metric, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div
                                className={cn(
                                    'absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full opacity-20 blur-3xl',
                                    metric.color.replace('from-', 'bg-'),
                                )}
                            ></div>
                            <div className="relative z-10">
                                <div className="mb-4 flex items-center justify-between">
                                    <div
                                        className={cn(
                                            'rounded-xl border p-2 shadow-inner',
                                            metric.bg,
                                        )}
                                    >
                                        <metric.icon className="h-5 w-5 text-neutral-900" />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 rounded-full border bg-white px-2 py-1 text-[10px] font-black tracking-tighter uppercase",
                                        metric.trend >= 0 ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {metric.trend >= 0 ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3" />
                                        )}
                                        {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black tracking-[0.2em] text-neutral-400 uppercase">
                                        {metric.title}
                                    </p>
                                    <h2 className="text-3xl font-black tracking-tighter text-neutral-900">
                                        {metric.value}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Revenue Multi-Area Chart */}
                    <Card className="col-span-12 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl shadow-neutral-200 lg:col-span-8">
                        <CardHeader className="flex flex-row items-center justify-between border-none p-8 pb-0">
                            <div>
                                <CardTitle className="mb-2 text-xs font-black tracking-[0.4em] text-neutral-400 uppercase">
                                    Revenue Growth
                                </CardTitle>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-neutral-900">
                                        Total Velocity
                                    </span>
                                    <span className={cn(
                                        "flex items-center gap-0.5 text-sm font-bold animate-pulse",
                                        metrics.velocityGrowth >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        <TrendingUp className="h-3.5 w-3.5" />{' '}
                                        {metrics.velocityGrowth >= 0 ? '+' : ''}{metrics.velocityGrowth}%
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-2 font-bold"
                            >
                                Last 6 Months
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={monthlyRevenue}>
                                    <defs>
                                        <linearGradient
                                            id="colorRevenue"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.15}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f5f5f5"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 900,
                                            fill: '#999',
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 900,
                                            fill: '#999',
                                        }}
                                        tickFormatter={(val) =>
                                            `$${val / 1000}k`
                                        }
                                    />
                                    <Tooltip
                                        content={<CustomTooltip prefix="$" />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Stage Distribution */}
                    <Card className="col-span-12 overflow-hidden rounded-[3rem] border border-none border-neutral-800 bg-neutral-900 shadow-2xl lg:col-span-4">
                        <CardHeader className="border-none p-8 pb-0">
                            <CardTitle className="mb-2 text-xs font-black tracking-[0.4em] text-neutral-500 uppercase">
                                Deal Pipeline
                            </CardTitle>
                            <span className="text-2xl font-black text-white">
                                Stage Volume
                            </span>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={dealsByStage}
                                    layout="vertical"
                                    margin={{ left: -20 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="stage"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 900,
                                            fill: '#666',
                                        }}
                                        width={100}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{
                                            fill: 'rgba(255,255,255,0.05)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#fbbf24"
                                        radius={[0, 8, 8, 0]}
                                        barSize={12}
                                        background={{ fill: '#333', radius: 8 }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Multi-Panel */}
                <div className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-3">
                    {/* Active Activity Feed */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
                        {/* Recent Activity */}
                        <div className="flex flex-col overflow-hidden rounded-[2.5rem] border bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b p-6">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-blue-50 p-1.5">
                                        <ActivityIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-xs font-black tracking-widest text-neutral-900 uppercase">
                                        Live Stream
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black tracking-tighter text-neutral-400 uppercase">
                                    Real-time
                                </span>
                            </div>
                            <div className="flex-1 p-3">
                                {activityFeed.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group flex cursor-default items-start gap-4 rounded-2xl p-3 transition-all hover:bg-neutral-50"
                                    >
                                        <div
                                            className={cn(
                                                'mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full shadow-sm',
                                                item.type === 'activity'
                                                    ? 'bg-blue-500'
                                                    : 'bg-purple-500',
                                            )}
                                        ></div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-0.5 flex items-center justify-between">
                                                <p className="text-[11px] font-black tracking-tighter text-neutral-900 uppercase">
                                                    {item.action}
                                                </p>
                                                <span className="text-[10px] font-bold text-neutral-400">
                                                    {format(
                                                        new Date(item.date),
                                                        'HH:mm',
                                                    )}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-neutral-500 transition-colors group-hover:text-neutral-900">
                                                {item.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-1.5">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full border bg-neutral-100 text-[7px] font-bold uppercase">
                                                    {item.user[0]}
                                                </div>
                                                <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                                                    {item.user}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Deals - Glass Card */}
                        <div className="flex flex-col overflow-hidden rounded-[2.5rem] border bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b p-6">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-50 p-1.5">
                                        <Briefcase className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xs font-black tracking-widest text-neutral-900 uppercase">
                                        Recent Deals
                                    </h3>
                                </div>
                                <Link
                                    href="/deals"
                                    className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="flex-1 divide-y divide-neutral-50 p-3">
                                {recentDeals.map((deal) => (
                                    <Link
                                        key={deal.id}
                                        href={`/deals/${deal.id}`}
                                        className="group flex items-center justify-between rounded-2xl p-4 transition-all hover:bg-neutral-50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black text-neutral-900 transition-colors group-hover:text-blue-600">
                                                {deal.name}
                                            </p>
                                            <p className="text-[10px] font-bold tracking-tighter text-neutral-400 uppercase">
                                                {deal.account?.name ||
                                                    'Individual'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black tracking-tighter text-neutral-900">
                                                {formatCurrency(deal.value)}
                                            </p>
                                            <div className="mt-1 flex items-center justify-end gap-1">
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase">
                                                    {deal.stage?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tasks & Top Entities */}
                    <div className="space-y-6">
                        {/* Tasks Card */}

                        {/* Top Performance Accounts */}
                        <div className="rounded-[2.5rem] border bg-white p-6 shadow-xl">
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-black tracking-widest text-neutral-400 uppercase">
                                <Users className="h-4 w-4" /> VIP Clients
                            </h3>
                            <div className="space-y-3">
                                {topAccounts.map((acc, idx) => (
                                    <Link
                                        key={acc.id}
                                        href={`/accounts/${acc.id}`}
                                        className="group flex items-center gap-4 rounded-2xl p-3 transition-all hover:bg-neutral-50"
                                    >
                                        <div className="flex h-10 w-10 transform items-center justify-center rounded-2xl bg-neutral-100 font-black text-neutral-400 transition-all group-hover:rotate-6 group-hover:bg-blue-600 group-hover:text-white">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-black tracking-tight text-neutral-900 uppercase">
                                                {acc.name}
                                            </p>
                                            <p className="text-[10px] font-bold tracking-tighter text-blue-600">
                                                {formatCurrency(
                                                    acc.total_value,
                                                )}{' '}
                                                Volume
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
