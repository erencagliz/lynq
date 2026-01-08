# Lynq CRM

> **Enterprise-Grade, Multi-Tenant CRM Platform**  
> Free, Open-Source, Self-Hosted – Built with Laravel & React

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-purple.svg)](https://inertiajs.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Current Modules](#current-modules)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Lynq** is a modern, enterprise-ready CRM platform designed to be a **100% free alternative to Salesforce**. Built with cutting-edge technologies, Lynq provides a complete customer relationship management solution with multi-tenancy support, allowing organizations to manage their sales, marketing, and customer service operations from a single, self-hosted platform.

### Key Highlights

- ✅ **Multi-Tenant Architecture**: Isolated data per organization with tenant-specific branding
- ✅ **Modern Tech Stack**: Laravel 11, React 19, Inertia.js, TypeScript
- ✅ **Enterprise Features**: RBAC, audit logging, activity tracking, advanced reporting
- ✅ **Beautiful UI**: Premium dashboard with glassmorphism, gradients, and micro-animations
- ✅ **Self-Hosted**: Complete control over your data and infrastructure
- ✅ **Extensible**: Plugin system, custom fields, workflow automation (planned)

---

## ✨ Features

### Core CRM Modules

#### 📊 **Dashboard**
- Real-time metrics and KPIs (revenue, deals, conversion rates)
- Advanced data visualization with Area and Bar charts
- Live activity stream with audit logs
- Pending tasks with overdue indicators
- Quick action center for rapid data entry
- Top accounts and recent deals panels

#### 👥 **Accounts & Contacts**
- Complete CRUD operations with advanced filtering
- Account hierarchy and parent-child relationships
- Contact management with role assignments
- Activity history and interaction tracking
- Notes and attachments support
- Cross-linking between related records

#### 🎯 **Leads**
- Lead capture and qualification
- Status tracking (New, Contacted, Qualified, Lost)
- Source attribution and campaign tracking
- Lead conversion workflow
- Activity and task management
- Notes and file attachments

#### 💼 **Deals (Opportunities)**
- Multi-pipeline support with customizable stages
- Deal value and probability tracking
- Account and contact associations
- Quote and invoice generation
- Activity timeline and audit history
- Stage-based workflow automation

#### ✅ **Tasks**
- Task creation and assignment
- Due date tracking with overdue alerts
- Status management (Pending, Completed, Deferred)
- Priority levels (High, Medium, Low)
- Polymorphic associations (Account, Contact, Lead, Deal)
- Activity history and audit logs

#### 💰 **Sales & Transactions**

**Quotes**
- Professional quote generation
- Line item management with pricing
- Account and contact linking
- Deal association
- Convert to invoice functionality
- PDF export and email delivery

**Invoices**
- Invoice creation from quotes
- Payment status tracking
- Multi-currency support
- Account and deal linking
- Payment reminders
- Financial reporting integration

#### 🎫 **Support & Service**

**Tickets**
- Multi-channel ticket creation
- Priority and status management
- SLA tracking
- Account and contact association
- Internal notes and customer communication
- Escalation workflows

#### 📅 **Calendar & Activities**
- Unified activity tracking (calls, meetings, emails)
- Task scheduling and reminders
- Calendar view with event management
- Activity history across all records
- User attribution and timestamps

---

## 🛠 Tech Stack

### Backend
- **Framework**: Laravel 11.x
- **Database**: MySQL / PostgreSQL / SQLite
- **Authentication**: Laravel Sanctum
- **Multi-Tenancy**: Custom tenant scoping
- **API**: RESTful with Inertia.js SSR

### Frontend
- **Framework**: React 19.x with TypeScript
- **Routing**: Inertia.js 2.x (SPA-like experience)
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 4.x
- **Charts**: Recharts
- **Forms**: React Hook Form
- **State Management**: Inertia.js shared data

### Development Tools
- **Build Tool**: Vite 7.x
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Type Checking**: TypeScript 5.x
- **Package Manager**: npm

---

## 🚀 Installation

### Prerequisites

- PHP 8.2 or higher
- Composer 2.x
- Node.js 18.x or higher
- npm or yarn
- MySQL 8.0+ / PostgreSQL 13+ / SQLite 3.x

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/erencagliz/lynq.git
   cd lynq
   ```

2. **Navigate to the web app**
   ```bash
   cd apps/web
   ```

3. **Install PHP dependencies**
   ```bash
   composer install
   ```

4. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

5. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

6. **Configure database**
   Edit `.env` and set your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=lynq
   DB_USERNAME=root
   DB_PASSWORD=
   ```

7. **Run migrations**
   ```bash
   php artisan migrate --seed
   ```

8. **Start development servers**
   ```bash
   # Terminal 1: Laravel server
   php artisan serve

   # Terminal 2: Vite dev server
   npm run dev
   ```

9. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

### Default Credentials
After seeding, you can log in with:
- **Email**: admin@example.com
- **Password**: password

---

## 📁 Project Structure

```
lynq/
├── apps/
│   └── web/                    # Main Laravel application
│       ├── app/
│       │   ├── Http/
│       │   │   └── Controllers/    # API & Page controllers
│       │   ├── Models/             # Eloquent models
│       │   └── Traits/             # Reusable traits
│       ├── database/
│       │   ├── migrations/         # Database schema
│       │   └── seeders/            # Sample data
│       ├── resources/
│       │   └── js/
│       │       ├── Pages/          # Inertia.js page components
│       │       ├── components/     # Reusable React components
│       │       ├── layouts/        # Layout components
│       │       └── types/          # TypeScript definitions
│       └── routes/
│           └── web.php             # Application routes
└── README.md
```

---

## 📦 Current Modules

### Implemented Features

#### ✅ **User Management**
- Multi-tenant user authentication
- Role-based access control (Admin, User)
- User profiles and settings
- Tenant isolation and scoping

#### ✅ **CRM Core**
- **Accounts**: Company/organization management
- **Contacts**: Individual contact records
- **Leads**: Lead capture and qualification
- **Deals**: Sales opportunity tracking
- **Tasks**: Task management and assignment

#### ✅ **Sales Operations**
- **Quotes**: Professional quotation system
- **Invoices**: Invoice generation and tracking
- **Pipelines**: Customizable sales pipelines
- **Stages**: Deal stage management

#### ✅ **Support & Service**
- **Tickets**: Customer support ticket system
- **Case Management**: Issue tracking and resolution

#### ✅ **Productivity**
- **Activities**: Unified activity tracking
- **Notes**: Polymorphic note system
- **Attachments**: File upload and management
- **Calendar**: Event and meeting scheduling

#### ✅ **Analytics & Reporting**
- **Dashboard**: Real-time metrics and KPIs
- **Charts**: Revenue trends, pipeline distribution
- **Activity Feed**: Live system events
- **Audit Logs**: Complete change history

#### ✅ **System Features**
- **Multi-Tenancy**: Complete tenant isolation
- **Audit Trail**: Comprehensive change tracking
- **Search & Filter**: Advanced filtering on all modules
- **Data Tables**: Sortable, searchable data grids
- **Responsive Design**: Mobile-friendly interface

---

## 🗺 Roadmap

### Phase 1: Foundation (✅ Completed)
- [x] Multi-tenant architecture
- [x] Core CRM modules (Accounts, Contacts, Leads, Deals)
- [x] Task management
- [x] Sales transactions (Quotes, Invoices)
- [x] Support tickets
- [x] Dashboard with analytics
- [x] Activity tracking and audit logs

### Phase 2: Automation & Workflows (🚧 In Progress)
- [ ] Visual workflow builder
- [ ] Process automation engine
- [ ] Email templates and campaigns
- [ ] Scheduled tasks and reminders
- [ ] Approval processes
- [ ] Webhook integrations

### Phase 3: Advanced Features (📋 Planned)
- [ ] Marketing automation
- [ ] Campaign management
- [ ] Lead scoring and nurturing
- [ ] Landing page builder
- [ ] Form builder
- [ ] Email marketing integration

### Phase 4: AI & Intelligence (🔮 Future)
- [ ] AI-powered lead scoring
- [ ] Deal probability prediction
- [ ] Sentiment analysis
- [ ] Next-best-action recommendations
- [ ] Automated insights
- [ ] Predictive analytics

### Phase 5: Enterprise & Scale (🏢 Future)
- [ ] Custom objects and fields
- [ ] Page layout builder
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Advanced security (field-level, record-level)
- [ ] API marketplace and plugins

### Phase 6: Mobile & Collaboration (📱 Future)
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Offline mode
- [ ] Real-time collaboration
- [ ] Internal messaging (Chatter-like)
- [ ] Document sharing

---

## 🎨 Design Philosophy

Lynq is built with a focus on:

1. **Premium UX**: Modern, beautiful interfaces with glassmorphism and micro-animations
2. **Performance**: Fast page loads, optimized queries, efficient rendering
3. **Accessibility**: WCAG-compliant, keyboard navigation, screen reader support
4. **Consistency**: Unified design language across all modules
5. **Extensibility**: Plugin architecture for custom functionality

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow PSR-12 for PHP code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Areas for Contribution

- 🐛 Bug fixes and issue resolution
- ✨ New features and enhancements
- 📝 Documentation improvements
- 🌐 Translations and localization
- 🎨 UI/UX improvements
- ⚡ Performance optimizations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Laravel](https://laravel.com)
- UI powered by [React](https://reactjs.org) and [Inertia.js](https://inertiajs.com)
- Components from [Radix UI](https://www.radix-ui.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Charts by [Recharts](https://recharts.org)