import InputError from '@/components/input-error';
import { SearchableSelect } from '@/components/searchable-select';
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
import { Account, BreadcrumbItem, Contact, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: '/contacts',
    },
    {
        title: 'New Contact',
        href: '/contacts/create',
    },
];

interface Props {
    accounts: Account[];
    users: User[];
    contacts: Contact[];
}

export default function Create({ accounts, users, contacts }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm<{
        first_name: string;
        last_name: string;
        account_id: string;
        title: string;
        department: string;
        email: string;
        phone: string;
        mobile_phone: string;
        fax: string;
        reports_to: string;
        lead_source: string;
        birthdate: string;
        mailing_street: string;
        mailing_city: string;
        mailing_state: string;
        mailing_postal_code: string;
        mailing_country: string;
        description: string;
        assigned_to: string;
        status: string;
    }>({
        first_name: '',
        last_name: '',
        account_id: 'none',
        title: '',
        department: '',
        email: '',
        phone: '',
        mobile_phone: '',
        fax: '',
        reports_to: 'none',
        lead_source: '',
        birthdate: '',
        mailing_street: '',
        mailing_city: '',
        mailing_state: '',
        mailing_postal_code: '',
        mailing_country: '',
        description: '',
        assigned_to: 'none',
        status: 'Active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            account_id: data.account_id === 'none' ? null : data.account_id,
            reports_to: data.reports_to === 'none' ? null : data.reports_to,
            assigned_to: data.assigned_to === 'none' ? null : data.assigned_to,
            birthdate: data.birthdate || null,
        }));
        post('/contacts');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Contact" />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">New Contact</h1>
                </div>

                <form onSubmit={submit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">
                                            First Name{' '}
                                            <span className="ml-0.5 text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    'first_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            placeholder="John"
                                        />
                                        <InputError
                                            message={errors.first_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            Last Name{' '}
                                            <span className="ml-0.5 text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    'last_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            placeholder="Doe"
                                        />
                                        <InputError
                                            message={errors.last_name}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="account_id">
                                        Account (Company)
                                    </Label>
                                    <SearchableSelect
                                        options={accounts.map((a) => ({
                                            value: a.id.toString(),
                                            label: a.name,
                                        }))}
                                        value={data.account_id}
                                        onValueChange={(val) =>
                                            setData('account_id', val)
                                        }
                                        placeholder="Select account"
                                        noneLabel="None"
                                    />
                                    <InputError message={errors.account_id} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="e.g. Sales Manager"
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="department">
                                            Department
                                        </Label>
                                        <Input
                                            id="department"
                                            value={data.department}
                                            onChange={(e) =>
                                                setData(
                                                    'department',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Sales"
                                        />
                                        <InputError
                                            message={errors.department}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">
                                        Status{' '}
                                        <span className="ml-0.5 text-red-500">
                                            *
                                        </span>
                                    </Label>
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
                                            <SelectItem value="Active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="Inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="Prospect">
                                                Prospect
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="john.doe@company.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Work Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mobile_phone">
                                            Mobile Phone
                                        </Label>
                                        <Input
                                            id="mobile_phone"
                                            value={data.mobile_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'mobile_phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.mobile_phone}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fax">Fax</Label>
                                        <Input
                                            id="fax"
                                            value={data.fax}
                                            onChange={(e) =>
                                                setData('fax', e.target.value)
                                            }
                                        />
                                        <InputError message={errors.fax} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lead_source">
                                            Lead Source
                                        </Label>
                                        <Select
                                            value={data.lead_source}
                                            onValueChange={(val) =>
                                                setData('lead_source', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Web">
                                                    Web
                                                </SelectItem>
                                                <SelectItem value="Referral">
                                                    Referral
                                                </SelectItem>
                                                <SelectItem value="Campaign">
                                                    Campaign
                                                </SelectItem>
                                                <SelectItem value="Event">
                                                    Event
                                                </SelectItem>
                                                <SelectItem value="Other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Address Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mailing_street">
                                        Mailing Street
                                    </Label>
                                    <Input
                                        id="mailing_street"
                                        value={data.mailing_street}
                                        onChange={(e) =>
                                            setData(
                                                'mailing_street',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mailing_city">
                                            City
                                        </Label>
                                        <Input
                                            id="mailing_city"
                                            value={data.mailing_city}
                                            onChange={(e) =>
                                                setData(
                                                    'mailing_city',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mailing_state">
                                            State/Region
                                        </Label>
                                        <Input
                                            id="mailing_state"
                                            value={data.mailing_state}
                                            onChange={(e) =>
                                                setData(
                                                    'mailing_state',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="mailing_postal_code">
                                            Postal Code
                                        </Label>
                                        <Input
                                            id="mailing_postal_code"
                                            value={data.mailing_postal_code}
                                            onChange={(e) =>
                                                setData(
                                                    'mailing_postal_code',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mailing_country">
                                            Country
                                        </Label>
                                        <Input
                                            id="mailing_country"
                                            value={data.mailing_country}
                                            onChange={(e) =>
                                                setData(
                                                    'mailing_country',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Relationships & Personal</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reports_to">
                                        Reports To (Manager)
                                    </Label>
                                    <SearchableSelect
                                        options={contacts.map((c) => ({
                                            value: c.id.toString(),
                                            label: `${c.first_name} ${c.last_name}`,
                                        }))}
                                        value={data.reports_to}
                                        onValueChange={(val) =>
                                            setData('reports_to', val)
                                        }
                                        placeholder="Select manager"
                                        noneLabel="None"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="birthdate">
                                            Birthdate
                                        </Label>
                                        <Input
                                            id="birthdate"
                                            type="date"
                                            value={data.birthdate}
                                            onChange={(e) =>
                                                setData(
                                                    'birthdate',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="assigned_to">
                                            Assigned To (Owner)
                                        </Label>
                                        <SearchableSelect
                                            options={users.map((u) => ({
                                                value: u.id.toString(),
                                                label: u.name,
                                            }))}
                                            value={data.assigned_to}
                                            onValueChange={(val) =>
                                                setData('assigned_to', val)
                                            }
                                            placeholder="Select user"
                                            noneLabel="Unassigned"
                                        />
                                    </div>
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
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="min-h-[100px]"
                                placeholder="Add notes or background about this contact..."
                            />
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
                            Create Contact
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
