<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Task;
use App\Models\Quote;
use App\Models\Invoice;
use App\Models\Ticket;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Activity;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Demo Tenant
        $tenant = Tenant::firstOrCreate(
            ['domain' => 'demo'],
            ['name' => 'Demo Organization']
        );

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'tenant_id' => $tenant->id,
            ]
        );

        // Create Regular User
        $user = User::firstOrCreate(
            ['email' => 'user@demo.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'tenant_id' => $tenant->id,
            ]
        );

        // Temporarily disable global scopes for seeding
        \App\Models\Account::withoutGlobalScopes()->delete();
        \App\Models\Contact::withoutGlobalScopes()->delete();
        \App\Models\Lead::withoutGlobalScopes()->delete();
        \App\Models\Deal::withoutGlobalScopes()->delete();
        \App\Models\Task::withoutGlobalScopes()->delete();

        // Create Sales Pipeline
        $pipeline = Pipeline::firstOrCreate(
            ['name' => 'Sales Pipeline', 'tenant_id' => $tenant->id],
            ['is_default' => true]
        );

        // Create Pipeline Stages
        $stages = [
            ['name' => 'Prospecting', 'probability' => 10, 'sort_order' => 1],
            ['name' => 'Qualification', 'probability' => 25, 'sort_order' => 2],
            ['name' => 'Proposal', 'probability' => 50, 'sort_order' => 3],
            ['name' => 'Negotiation', 'probability' => 75, 'sort_order' => 4],
            ['name' => 'Closed Won', 'probability' => 100, 'sort_order' => 5],
            ['name' => 'Closed Lost', 'probability' => 0, 'sort_order' => 6],
        ];

        foreach ($stages as $stageData) {
            PipelineStage::firstOrCreate(
                [
                    'pipeline_id' => $pipeline->id,
                    'name' => $stageData['name'],
                ],
                [
                    'probability' => $stageData['probability'],
                    'sort_order' => $stageData['sort_order'],
                    'tenant_id' => $tenant->id,
                ]
            );
        }

        // Create Sample Accounts
        $accounts = [
            [
                'name' => 'Acme Corporation',
                'industry' => 'Technology',
                'website' => 'https://acme.example.com',
                'phone' => '+1 (555) 123-4567',
                'status' => 'Active',
                'address' => '123 Tech Street',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip' => '94102',
                'country' => 'USA',
            ],
            [
                'name' => 'Global Solutions Inc',
                'industry' => 'Consulting',
                'website' => 'https://globalsolutions.example.com',
                'phone' => '+1 (555) 234-5678',
                'status' => 'Active',
                'address' => '456 Business Ave',
                'city' => 'New York',
                'state' => 'NY',
                'zip' => '10001',
                'country' => 'USA',
            ],
            [
                'name' => 'Tech Innovators LLC',
                'industry' => 'Software',
                'website' => 'https://techinnovators.example.com',
                'phone' => '+1 (555) 345-6789',
                'status' => 'Active',
                'address' => '789 Innovation Blvd',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '73301',
                'country' => 'USA',
            ],
        ];

        $createdAccounts = [];
        foreach ($accounts as $accountData) {
            $createdAccounts[] = Account::create(array_merge($accountData, [
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
            ]));
        }

        // Create Sample Contacts
        $contacts = [
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@acme.example.com',
                'phone' => '+1 (555) 111-2222',
                'title' => 'CEO',
                'status' => 'Active',
                'account_id' => $createdAccounts[0]->id,
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'email' => 'michael.chen@globalsolutions.example.com',
                'phone' => '+1 (555) 222-3333',
                'title' => 'VP of Sales',
                'status' => 'Active',
                'account_id' => $createdAccounts[1]->id,
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Rodriguez',
                'email' => 'emily.rodriguez@techinnovators.example.com',
                'phone' => '+1 (555) 333-4444',
                'title' => 'CTO',
                'status' => 'Active',
                'account_id' => $createdAccounts[2]->id,
            ],
        ];

        $createdContacts = [];
        foreach ($contacts as $contactData) {
            $createdContacts[] = Contact::create(array_merge($contactData, [
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
            ]));
        }

        // Create Sample Leads
        $leads = [
            [
                'first_name' => 'David',
                'last_name' => 'Williams',
                'email' => 'david.williams@example.com',
                'phone' => '+1 (555) 444-5555',
                'company' => 'Williams Enterprises',
                'title' => 'Director of Operations',
                'status' => 'New',
                'source' => 'Website',
            ],
            [
                'first_name' => 'Lisa',
                'last_name' => 'Anderson',
                'email' => 'lisa.anderson@example.com',
                'phone' => '+1 (555) 555-6666',
                'company' => 'Anderson & Co',
                'title' => 'Marketing Manager',
                'status' => 'Contacted',
                'source' => 'Referral',
            ],
        ];

        foreach ($leads as $leadData) {
            Lead::create(array_merge($leadData, [
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
            ]));
        }

        // Create Sample Deals
        $prospectingStage = PipelineStage::where('name', 'Prospecting')->first();
        $qualificationStage = PipelineStage::where('name', 'Qualification')->first();
        $proposalStage = PipelineStage::where('name', 'Proposal')->first();

        $deals = [
            [
                'name' => 'Enterprise Software License',
                'value' => 50000,
                'account_id' => $createdAccounts[0]->id,
                'contact_id' => $createdContacts[0]->id,
                'pipeline_id' => $pipeline->id,
                'pipeline_stage_id' => $proposalStage->id,
                'expected_close_date' => now()->addDays(30),
            ],
            [
                'name' => 'Consulting Services Package',
                'value' => 75000,
                'account_id' => $createdAccounts[1]->id,
                'contact_id' => $createdContacts[1]->id,
                'pipeline_id' => $pipeline->id,
                'pipeline_stage_id' => $qualificationStage->id,
                'expected_close_date' => now()->addDays(45),
            ],
            [
                'name' => 'Cloud Infrastructure Setup',
                'value' => 100000,
                'account_id' => $createdAccounts[2]->id,
                'contact_id' => $createdContacts[2]->id,
                'pipeline_id' => $pipeline->id,
                'pipeline_stage_id' => $prospectingStage->id,
                'expected_close_date' => now()->addDays(60),
            ],
        ];

        $createdDeals = [];
        foreach ($deals as $dealData) {
            $createdDeals[] = Deal::create(array_merge($dealData, [
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
            ]));
        }

        // Create Sample Tasks
        $tasks = [
            [
                'subject' => 'Follow up with Acme Corporation',
                'description' => 'Schedule a demo call to discuss their requirements',
                'status' => 'Pending',
                'priority' => 'High',
                'due_date' => now()->addDays(2),
                'taskable_type' => 'App\\Models\\Deal',
                'taskable_id' => $createdDeals[0]->id,
                'assignee_id' => $admin->id,
            ],
            [
                'subject' => 'Prepare proposal for Global Solutions',
                'description' => 'Create detailed proposal with pricing and timeline',
                'status' => 'Pending',
                'priority' => 'Medium',
                'due_date' => now()->addDays(5),
                'taskable_type' => 'App\\Models\\Deal',
                'taskable_id' => $createdDeals[1]->id,
                'assignee_id' => $user->id,
            ],
            [
                'subject' => 'Research Tech Innovators requirements',
                'description' => 'Gather information about their current infrastructure',
                'status' => 'Completed',
                'priority' => 'Low',
                'due_date' => now()->subDays(1),
                'taskable_type' => 'App\\Models\\Account',
                'taskable_id' => $createdAccounts[2]->id,
                'assignee_id' => $admin->id,
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::create(array_merge($taskData, [
                'tenant_id' => $tenant->id,
                'creator_id' => $admin->id,
            ]));
        }

        // Create Sample Quotes
        $quote = Quote::create([
            'tenant_id' => $tenant->id,
            'quote_number' => 'QUO-2026-001',
            'subject' => 'Enterprise Software License Quote',
            'account_id' => $createdAccounts[0]->id,
            'contact_id' => $createdContacts[0]->id,
            'deal_id' => $createdDeals[0]->id,
            'status' => 'Sent',
            'total_amount' => 50000,
            'currency' => 'USD',
            'valid_until' => now()->addDays(30),
            'notes' => 'Standard enterprise license with premium support',
            'owner_id' => $admin->id,
        ]);

        // Create Quote Items
        \App\Models\QuoteItem::create([
            'quote_id' => $quote->id,
            'description' => 'Enterprise Software License (Annual)',
            'quantity' => 1,
            'unit_price' => 40000,
            'subtotal' => 40000,
        ]);

        \App\Models\QuoteItem::create([
            'quote_id' => $quote->id,
            'description' => 'Premium Support Package',
            'quantity' => 1,
            'unit_price' => 10000,
            'subtotal' => 10000,
        ]);

        // Create Sample Invoice
        $invoice = Invoice::create([
            'tenant_id' => $tenant->id,
            'invoice_number' => 'INV-2026-001',
            'subject' => 'Enterprise Software License',
            'account_id' => $createdAccounts[0]->id,
            'contact_id' => $createdContacts[0]->id,
            'deal_id' => $createdDeals[0]->id,
            'quote_id' => $quote->id,
            'status' => 'Sent',
            'total_amount' => 50000,
            'currency' => 'USD',
            'due_date' => now()->addDays(30),
            'notes' => 'Payment terms: Net 30',
            'owner_id' => $admin->id,
        ]);

        // Create Invoice Items
        \App\Models\InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Enterprise Software License (Annual)',
            'quantity' => 1,
            'unit_price' => 40000,
            'subtotal' => 40000,
        ]);

        \App\Models\InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Premium Support Package',
            'quantity' => 1,
            'unit_price' => 10000,
            'subtotal' => 10000,
        ]);

        // Create Sample Tickets
        $tickets = [
            [
                'ticket_number' => 'TKT-2026-001',
                'subject' => 'Login Issues',
                'description' => 'User unable to login to the system',
                'status' => 'Open',
                'priority' => 'High',
                'account_id' => $createdAccounts[0]->id,
                'contact_id' => $createdContacts[0]->id,
                'assignee_id' => $admin->id,
            ],
            [
                'ticket_number' => 'TKT-2026-002',
                'subject' => 'Feature Request: Export to Excel',
                'description' => 'Customer requesting ability to export reports to Excel',
                'status' => 'In Progress',
                'priority' => 'Medium',
                'account_id' => $createdAccounts[1]->id,
                'contact_id' => $createdContacts[1]->id,
                'assignee_id' => $user->id,
            ],
        ];

        foreach ($tickets as $ticketData) {
            Ticket::create(array_merge($ticketData, [
                'tenant_id' => $tenant->id,
            ]));
        }

        // Create Sample Activities
        Activity::create([
            'tenant_id' => $tenant->id,
            'subject_type' => 'App\\Models\\Deal',
            'subject_id' => $createdDeals[0]->id,
            'type' => 'call',
            'description' => 'Initial discovery call with Sarah Johnson',
            'performed_at' => now()->subDays(3),
            'user_id' => $admin->id,
        ]);

        Activity::create([
            'tenant_id' => $tenant->id,
            'subject_type' => 'App\\Models\\Deal',
            'subject_id' => $createdDeals[1]->id,
            'type' => 'meeting',
            'description' => 'Presentation of consulting services',
            'performed_at' => now()->subDays(1),
            'user_id' => $admin->id,
        ]);

        // Create Sample Notes
        Note::create([
            'tenant_id' => $tenant->id,
            'notable_type' => 'App\\Models\\Deal',
            'notable_id' => $createdDeals[0]->id,
            'content' => 'Customer is very interested in the enterprise package. They need approval from their board before proceeding.',
            'creator_id' => $admin->id,
        ]);

        Note::create([
            'tenant_id' => $tenant->id,
            'notable_type' => 'App\\Models\\Account',
            'notable_id' => $createdAccounts[1]->id,
            'content' => 'Key decision maker is Michael Chen. He prefers email communication over phone calls.',
            'creator_id' => $admin->id,
        ]);

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Email: admin@demo.com');
        $this->command->info('Password: password');
        $this->command->info('');
        $this->command->info('Alternative user:');
        $this->command->info('Email: user@demo.com');
        $this->command->info('Password: password');
    }
}
