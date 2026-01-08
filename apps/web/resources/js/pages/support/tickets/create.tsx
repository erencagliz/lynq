import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    accounts: any[];
    contacts: any[];
    users: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tickets', href: '/tickets' },
    { title: 'New Ticket', href: '/tickets/create' },
];

export default function Create({ accounts, contacts, users }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm({
        subject: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        account_id: '',
        contact_id: '',
        user_id: '', // Assignee
    });

    transform((data) => ({
        ...data,
        account_id: data.account_id || null,
        contact_id: data.contact_id || null,
        user_id: data.user_id || null,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tickets');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Ticket" />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">New Ticket</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">
                                        Ticket Subject{' '}
                                        <span className="ml-0.5 text-red-500">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) =>
                                            setData('subject', e.target.value)
                                        }
                                        required
                                        placeholder="e.g., Cannot access dashboard"
                                    />
                                    <InputError message={errors.subject} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="account_id">Account</Label>
                                    <Select
                                        value={data.account_id}
                                        onValueChange={(val) =>
                                            setData('account_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem
                                                    key={acc.id}
                                                    value={acc.id.toString()}
                                                >
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_id">Contact</Label>
                                    <Select
                                        value={data.contact_id}
                                        onValueChange={(val) =>
                                            setData('contact_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select contact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contacts.map((contact) => (
                                                <SelectItem
                                                    key={contact.id}
                                                    value={contact.id.toString()}
                                                >
                                                    {contact.first_name}{' '}
                                                    {contact.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) =>
                                                setData('status', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">
                                                    Open
                                                </SelectItem>
                                                <SelectItem value="In Progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="Resolved">
                                                    Resolved
                                                </SelectItem>
                                                <SelectItem value="Closed">
                                                    Closed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">
                                            Priority
                                        </Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(val) =>
                                                setData('priority', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">
                                                    Low
                                                </SelectItem>
                                                <SelectItem value="Medium">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="High">
                                                    High
                                                </SelectItem>
                                                <SelectItem value="Urgent">
                                                    Urgent
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="user_id">Assignee</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(val) =>
                                            setData('user_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Provide as much detail as possible..."
                                className="min-h-[200px]"
                            />
                            <InputError message={errors.description} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
