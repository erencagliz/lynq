import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    tenant_id?: number;
    roles?: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Account {
    id: number;
    parent_id?: number | null;
    name: string;
    account_type?: string | null;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    fax?: string | null;
    email?: string | null;
    address_street?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_postal_code?: string | null;
    address_country?: string | null;
    number_of_employees?: number | null;
    annual_revenue?: number | null;
    rating?: string | null;
    ownership?: string | null;
    description?: string | null;
    created_by?: number | null;
    assigned_to?: number | null;
    status: string;
    created_at: string;
    updated_at: string;
    owner?: User;
    parent?: Account;
}

export interface Contact {
    id: number;
    account_id?: number | null;
    first_name: string;
    last_name: string;
    full_name?: string;
    title?: string | null;
    department?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile_phone?: string | null;
    fax?: string | null;
    assistant_name?: string | null;
    assistant_phone?: string | null;
    reports_to?: number | null;
    lead_source?: string | null;
    birthdate?: string | null;
    mailing_street?: string | null;
    mailing_city?: string | null;
    mailing_state?: string | null;
    mailing_postal_code?: string | null;
    mailing_country?: string | null;
    description?: string | null;
    assigned_to?: number | null;
    status: string;
    created_at: string;
    updated_at: string;
    account?: Account;
    manager?: Contact;
    owner?: User;
    creator?: User;
}

export interface Pipeline {
    id: number;
    name: string;
    is_default: boolean;
    stages: PipelineStage[];
    created_at: string;
}

export interface PipelineStage {
    id: number;
    pipeline_id: number;
    name: string;
    probability: number;
    sort_order: number;
}

export interface Deal {
    id: number;
    name: string;
    value: number;
    currency: string;
    expected_close_date: string | null;
    pipeline_id: number;
    pipeline_stage_id: number;
    account_id: number | null;
    contact_id: number | null;
    account?: Account;
    contact?: Contact;
    pipeline?: Pipeline;
    stage?: PipelineStage;
    created_at: string;
}

export interface Task {
    id: number;
    tenant_id: number;
    taskable_id: number;
    taskable_type: string;
    assigned_to: number | null;
    created_by: number;
    subject: string;
    type: 'Task' | 'Call' | 'Email' | 'Meeting';
    due_date: string | null;
    status: 'Pending' | 'Completed' | 'Deferred';
    priority: 'Low' | 'Normal' | 'High';
    description: string | null;
    assignee?: User;
    creator?: User;
    created_at: string;
}

export interface Note {
    id: number;
    tenant_id: number;
    notable_id: number;
    notable_type: string;
    created_by: number;
    content: string;
    creator?: User;
    created_at: string;
}

export interface Attachment {
    id: number;
    tenant_id: number;
    attachable_id: number;
    attachable_type: string;
    uploaded_by: number;
    file_path: string;
    file_name: string;
    file_size: string;
    mime_type: string;
    uploader?: User;
    created_at: string;
}

export interface Activity {
    id: number;
    tenant_id: number;
    user_id: number;
    subject_type: string;
    subject_id: number;
    type: 'note' | 'call' | 'email' | 'meeting';
    description: string;
    performed_at: string;
    user?: User;
    created_at: string;
}

export interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    account_id: number | null;
    contact_id: number | null;
    user_id: number | null;
    tenant_id: number;
    account?: Account;
    contact?: Contact;
    assignee?: User;
    created_at: string;
}

export interface Quote {
    id: number;
    quote_number: string;
    subject: string;
    account_id: number | null;
    contact_id: number | null;
    deal_id: number | null;
    status: string;
    valid_until: string | null;
    total_amount: number;
    currency: string;
    notes: string | null;
    items?: QuoteItem[];
    account?: Account;
    contact?: Contact;
    deal?: Deal;
    created_at: string;
}

export interface QuoteItem {
    id: number;
    quote_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    subject: string;
    account_id: number | null;
    contact_id: number | null;
    deal_id: number | null;
    status: string;
    due_date: string | null;
    total_amount: number;
    currency: string;
    notes: string | null;
    items?: InvoiceItem[];
    account?: Account;
    contact?: Contact;
    deal?: Deal;
    created_at: string;
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}
