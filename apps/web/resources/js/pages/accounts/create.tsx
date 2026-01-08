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
import * as accountsRoutes from '@/routes/accounts';
import { Account, BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: '/accounts',
    },
    {
        title: 'New Account',
        href: '/accounts/create',
    },
];

interface Props {
    accounts: Account[];
    users: User[];
}

export default function Create({ accounts, users }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm<{
        name: string;
        parent_id: string;
        account_type: string;
        industry: string;
        website: string;
        phone: string;
        fax: string;
        email: string;
        address_street: string;
        address_city: string;
        address_state: string;
        address_postal_code: string;
        address_country: string;
        number_of_employees: string;
        rating: string;
        ownership: string;
        description: string;
        assigned_to: string;
        status: string;
    }>({
        name: '',
        parent_id: 'none',
        account_type: 'Customer',
        industry: '',
        website: '',
        phone: '',
        fax: '',
        email: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_postal_code: '',
        address_country: '',
        number_of_employees: '',
        rating: 'Hot',
        ownership: 'Private',
        description: '',
        assigned_to: 'none',
        status: 'Active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            parent_id: data.parent_id === 'none' ? null : data.parent_id,
            assigned_to: data.assigned_to === 'none' ? null : data.assigned_to,
        }));
        post(accountsRoutes.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Account" />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">New Account</h1>
                </div>

                <form onSubmit={submit} className="space-y-6 pb-20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Account Name{' '}
                                        <span className="ml-0.5 text-red-500">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                        placeholder="Acme Corp"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="parent_id">
                                        Parent Account
                                    </Label>
                                    <SearchableSelect
                                        options={accounts.map((a) => ({
                                            value: a.id.toString(),
                                            label: a.name,
                                        }))}
                                        value={data.parent_id}
                                        onValueChange={(val) =>
                                            setData('parent_id', val)
                                        }
                                        placeholder="Select parent account"
                                        noneLabel="None"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_type">
                                            Account Type
                                        </Label>
                                        <Select
                                            value={data.account_type}
                                            onValueChange={(val) =>
                                                setData('account_type', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Customer">
                                                    Customer
                                                </SelectItem>
                                                <SelectItem value="Partner">
                                                    Partner
                                                </SelectItem>
                                                <SelectItem value="Vendor">
                                                    Vendor
                                                </SelectItem>
                                                <SelectItem value="Prospect">
                                                    Prospect
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                        placeholder="contact@company.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
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
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={data.website}
                                            onChange={(e) =>
                                                setData(
                                                    'website',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://..."
                                        />
                                        <InputError message={errors.website} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input
                                        id="industry"
                                        value={data.industry}
                                        onChange={(e) =>
                                            setData('industry', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.industry} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Address Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="address_street">
                                        Street Address
                                    </Label>
                                    <Input
                                        id="address_street"
                                        value={data.address_street}
                                        onChange={(e) =>
                                            setData(
                                                'address_street',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.address_street}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="address_city">
                                            City
                                        </Label>
                                        <Input
                                            id="address_city"
                                            value={data.address_city}
                                            onChange={(e) =>
                                                setData(
                                                    'address_city',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.address_city}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address_state">
                                            State/Region
                                        </Label>
                                        <Input
                                            id="address_state"
                                            value={data.address_state}
                                            onChange={(e) =>
                                                setData(
                                                    'address_state',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.address_state}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="address_postal_code">
                                            Postal Code
                                        </Label>
                                        <Input
                                            id="address_postal_code"
                                            value={data.address_postal_code}
                                            onChange={(e) =>
                                                setData(
                                                    'address_postal_code',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.address_postal_code}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address_country">
                                            Country
                                        </Label>
                                        <Input
                                            id="address_country"
                                            value={data.address_country}
                                            onChange={(e) =>
                                                setData(
                                                    'address_country',
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
                                <CardTitle>Firmographics & Ownership</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="rating">Rating</Label>
                                        <Select
                                            value={data.rating}
                                            onValueChange={(val) =>
                                                setData('rating', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hot">
                                                    Hot
                                                </SelectItem>
                                                <SelectItem value="Warm">
                                                    Warm
                                                </SelectItem>
                                                <SelectItem value="Cold">
                                                    Cold
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="ownership">
                                            Ownership
                                        </Label>
                                        <Select
                                            value={data.ownership}
                                            onValueChange={(val) =>
                                                setData('ownership', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Private">
                                                    Private
                                                </SelectItem>
                                                <SelectItem value="Public">
                                                    Public
                                                </SelectItem>
                                                <SelectItem value="Government">
                                                    Government
                                                </SelectItem>
                                                <SelectItem value="NGO">
                                                    NGO
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="assigned_to">
                                        Assigned To
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
                                placeholder="Add notes or background about this account..."
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
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
