1️⃣ Multi-Tenant Core

Tenant izolasyonu (row-level, tüm tablolar tenant-aware)

Organization CRUD (create / update / delete / archive)

Tenant context middleware → tüm API ve frontend tenant-aware

Tenant branding (logo, color, theme)

Tenant-specific feature toggles / plan flags

2️⃣ Authentication & Access Control

Email/password signup & login

JWT & session based auth

Role-Based Access Control (RBAC): Owner, Admin, Member

Tenant-aware auth → cross-tenant güvenlik yok

Password reset / forgot password

Multi-factor authentication (MFA) – opsiyonel

SSO / OAuth (Google, Microsoft, SAML) – opsiyonel enterprise

Session management & token rotation

3️⃣ Contacts / Accounts

Contact CRUD

Tenant-specific custom fields

Tags / categories / notes

Import / export CSV

Activity log per contact

Contact grouping / smart lists

Contact assignments (Owner / Team)

Advanced search & filter

4️⃣ Deals / Opportunities / Pipelines

Deal CRUD

Configurable stages per tenant (Kanban board)

Deal notes, tasks, reminders

Deal history & audit log

Deal assignment per user/team

Deal reports & analytics

Deal priority / scoring (AI suggestions optional)

5️⃣ Tasks / Activities / Reminders

Task CRUD per tenant

Assign tasks per user/team

Due dates, reminders, recurring tasks

Activity log (calls, emails, meetings)

Calendar integration – optional

Task notifications & email alerts

6️⃣ Dashboard & Analytics

Tenant overview dashboard: contacts, deals, tasks

Charts: deals per stage, activity trends, performance metrics

Customizable widgets & tenant-specific themes

Reporting & export (PDF / CSV)

KPI tracking per tenant

Custom dashboards (drag-drop widgets) – v3

Real-time updates (WebSockets / polling)

7️⃣ Notifications

Email notifications (new contact, new deal, task assigned, reminders)

In-app notifications

Webhook support (Slack, Teams, Discord, Zapier)

Tenant-level notification settings

Notification templates per tenant

8️⃣ Audit & Compliance

Immutable audit log (who, what, when, tenant)

Admin panel for audit viewing

Soft delete / restore entities

GDPR & privacy compliance flags

Data export per tenant

Audit filters: user, date, action, entity type

9️⃣ Theme / Branding

Multi-tenant theme support

Light / dark mode toggle

Tenant-specific branding (logo, color palette, custom CSS)

Prebuilt theme templates

Easy theme switching per tenant

Frontend component library (Tailwind / Bootstrap)

🔟 Settings & Integrations

Tenant settings panel: timezone, language, currency

App-wide settings: email templates, feature toggles

Webhooks / API integrations

File attachments for contacts/deals/tasks

Multi-language support (i18n)

Optional billing / plan management (mock or real)

1️⃣1️⃣ Advanced / Optional Enterprise Features

SSO / OAuth login (Google, Microsoft, SAML)

Multi-region DB support / scalability

Rate-limiting per tenant

Workflow automation engine (e.g., new deal → email alert)

AI suggestions / lead scoring / deal ranking

Custom dashboards & widget marketplace

Mobile-first UI / responsive enhancements

Audit & compliance for HIPAA / enterprise requirements

Event system / webhooks for external integrations