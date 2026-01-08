import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CreditCard,
    FileText,
    LayoutDashboard,
    LifeBuoy,
    Plus,
    Receipt,
    Settings,
    User,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandMenu() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/dashboard'))
                        }
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/deals'))
                        }
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Deals</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/contacts'))
                        }
                    >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Contacts</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/accounts'))
                        }
                    >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Accounts</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/leads'))
                        }
                    >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Leads</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/tasks'))
                        }
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Tasks</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/quotes'))
                        }
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Quotes</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/invoices'))
                        }
                    >
                        <Receipt className="mr-2 h-4 w-4" />
                        <span>Invoices</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/tickets'))
                        }
                    >
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Tickets</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/deals/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Deal</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/contacts/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Contact</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/accounts/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Account</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/leads/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Lead</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/quotes/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Quote</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/invoices/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Invoice</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/tickets/create'))
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Ticket</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/settings/profile'))
                        }
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() => router.visit('/settings'))
                        }
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            runCommand(() =>
                                router.visit('/settings/workflows'),
                            )
                        }
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        <span>Workflows</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
