<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $currentMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        // 1. Current Month Key Metrics
        // Won Deals: Probability = 100
        $wonDealsQuery = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        });
        $totalRevenue = $wonDealsQuery->sum('value');
        $wonDealsCount = $wonDealsQuery->count();

        // Previous Month Won Deals
        $prevMonthRevenue = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        })
            ->whereBetween('updated_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('value');

        // Calculate revenue growth
        $revenueGrowth = $prevMonthRevenue > 0
            ? round((($totalRevenue - $prevMonthRevenue) / $prevMonthRevenue) * 100, 1)
            : 0;

        // Active Deals: 0 < Probability < 100
        $activeDealsCount = Deal::whereHas('stage', function ($q) {
            $q->where('probability', '>', 0)
                ->where('probability', '<', 100);
        })->count();

        // Previous Month Active Deals
        $prevMonthActiveDeals = Deal::whereHas('stage', function ($q) {
            $q->where('probability', '>', 0)
                ->where('probability', '<', 100);
        })
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        // Calculate active deals growth
        $activeDealsGrowth = $prevMonthActiveDeals > 0
            ? round((($activeDealsCount - $prevMonthActiveDeals) / $prevMonthActiveDeals) * 100, 1)
            : 0;

        // Lost Deals: Probability = 0
        $lostDealsCount = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 0);
        })->count();

        // Conversion Rate: Won / (Won + Lost)
        $closedDealsCount = $wonDealsCount + $lostDealsCount;
        $conversionRate = $closedDealsCount > 0
            ? round(($wonDealsCount / $closedDealsCount) * 100, 1)
            : 0;

        // Previous Month Conversion Rate
        $prevMonthWonDeals = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        })
            ->whereBetween('updated_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $prevMonthLostDeals = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 0);
        })
            ->whereBetween('updated_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $prevMonthClosedDeals = $prevMonthWonDeals + $prevMonthLostDeals;
        $prevMonthConversionRate = $prevMonthClosedDeals > 0
            ? round(($prevMonthWonDeals / $prevMonthClosedDeals) * 100, 1)
            : 0;

        // Calculate conversion rate change (percentage points, not growth %)
        $conversionRateChange = $conversionRate - $prevMonthConversionRate;

        // Accounts & Contacts
        $totalAccounts = Account::where('status', 'Active')->count();
        $totalContacts = Contact::where('status', 'Active')->count();

        // Previous Month Accounts
        $prevMonthAccounts = Account::where('status', 'Active')
            ->where('created_at', '<=', $lastMonthEnd)
            ->count();

        // Calculate accounts growth
        $accountsGrowth = $prevMonthAccounts > 0
            ? round((($totalAccounts - $prevMonthAccounts) / $prevMonthAccounts) * 100, 1)
            : 0;

        // 2. Monthly Revenue (last 6 months)
        $connection = DB::connection()->getDriverName();
        $dateFormat = $connection === 'sqlite'
            ? 'strftime("%Y-%m", updated_at)'
            : 'DATE_FORMAT(updated_at, "%Y-%m")';

        $monthlyRevenue = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        })
            ->where('updated_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("$dateFormat as month"),
                DB::raw('SUM(value) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Calculate overall revenue velocity growth (comparing last 3 months vs previous 3 months)
        $recentThreeMonths = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        })
            ->whereBetween('updated_at', [now()->subMonths(3), now()])
            ->sum('value');

        $previousThreeMonths = Deal::whereHas('stage', function ($q) {
            $q->where('probability', 100);
        })
            ->whereBetween('updated_at', [now()->subMonths(6), now()->subMonths(3)])
            ->sum('value');

        $velocityGrowth = $previousThreeMonths > 0
            ? round((($recentThreeMonths - $previousThreeMonths) / $previousThreeMonths) * 100, 1)
            : 0;

        // 3. Deals by Pipeline Stage
        // We only want active deals here ideally, or all? Usually pipeline view shows active.
        // But dashboard might want all. Let's show all distribution for now, or maybe exclude Lost/Won?
        // Let's exclude Lost (0%) but include Won (100%) and Active.
        // Actually, usually "Deals by Stage" includes everything currently in that stage.
        $dealsByStage = Deal::with('stage')
            ->select('pipeline_stage_id', DB::raw('count(*) as count'), DB::raw('sum(value) as total_value'))
            ->whereNotNull('pipeline_stage_id')
            ->groupBy('pipeline_stage_id')
            ->get()
            ->map(function ($item) {
                return [
                    'stage' => $item->stage->name ?? 'Unknown',
                    'count' => $item->count,
                    'value' => (float) $item->total_value,
                ];
            });

        // 4. Top Accounts by Deal Value (Closed Won)
        // We generally care about revenue generated, so filters for Won deals.
        $topAccounts = Account::withSum([
            'deals' => function ($q) {
                $q->whereHas('stage', fn($sq) => $sq->where('probability', 100));
            }
        ], 'value')
            ->orderByDesc('deals_sum_value')
            ->limit(5)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'total_value' => (float) ($account->deals_sum_value ?? 0),
                ];
            });

        // 5. Recent Deals
        $recentDeals = Deal::with(['account', 'contact', 'stage'])
            ->latest()
            ->limit(5)
            ->get();

        // 6. Pending Tasks (Not Completed, ordered by Due Date)
        $pendingTasks = Task::with(['taskable', 'assignee'])
            ->where('status', '!=', 'Completed')
            ->orderBy('due_date', 'asc')
            ->limit(6)
            ->get();

        // 6b. Upcoming Tasks (Future tasks, ordered by Due Date)
        $upcomingTasks = Task::with(['taskable', 'assignee'])
            ->where('status', '!=', 'Completed')
            ->where('due_date', '>', now())
            ->orderBy('due_date', 'asc')
            ->limit(6)
            ->get();

        // 7. Recent Activity Feed (Combined Activities & Audit Logs)
        $activities = \App\Models\Activity::with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'type' => 'activity',
                    'action' => $a->type,
                    'description' => $a->description,
                    'user' => $a->user->name ?? 'System',
                    'date' => $a->created_at,
                ];
            });

        $auditLogs = \App\Models\AuditLog::with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($log) {
                $modelName = class_basename($log->auditable_type);
                $event = ucfirst($log->event);
                return [
                    'id' => $log->id,
                    'type' => 'audit',
                    'action' => "$modelName $event",
                    'description' => "Modified $modelName record",
                    'user' => $log->user->name ?? 'System',
                    'date' => $log->created_at,
                ];
            });

        $feed = $activities->concat($auditLogs)
            ->sortByDesc('date')
            ->values()
            ->take(10);

        return Inertia::render('dashboard/index', [
            'metrics' => [
                'totalRevenue' => $totalRevenue,
                'revenueGrowth' => $revenueGrowth,
                'activeDeals' => $activeDealsCount,
                'activeDealsGrowth' => $activeDealsGrowth,
                'conversionRate' => $conversionRate,
                'conversionRateChange' => $conversionRateChange,
                'totalAccounts' => $totalAccounts,
                'accountsGrowth' => $accountsGrowth,
                'totalContacts' => $totalContacts,
                'wonDeals' => $wonDealsCount,
                'velocityGrowth' => $velocityGrowth,
            ],
            'monthlyRevenue' => $monthlyRevenue,
            'dealsByStage' => $dealsByStage,
            'topAccounts' => $topAccounts,
            'recentDeals' => $recentDeals,
            'pendingTasks' => $pendingTasks,
            'upcomingTasks' => $upcomingTasks,
            'activityFeed' => $feed,
        ]);
    }
}
