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
import { Account, BreadcrumbItem, Contact, Deal } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuoteItem {
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Quote {
    id: number;
    subject: string;
    account_id: number | string;
    contact_id: number | string;
    deal_id: number | string;
    valid_until: string;
    currency: string;
    notes: string;
    items: QuoteItem[];
}

interface Props {
    quote: Quote;
    accounts: Account[];
    contacts: Contact[];
    deals: Deal[];
}

export default function Edit({ quote, accounts, contacts, deals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quotes', href: '/quotes' },
        { title: quote.subject, href: `/quotes/${quote.id}` },
        { title: 'Edit', href: `/quotes/${quote.id}/edit` },
    ];

    const { data, setData, patch, processing, errors, transform } = useForm({
        subject: quote.subject || '',
        account_id: quote.account_id?.toString() || '',
        contact_id: quote.contact_id?.toString() || '',
        deal_id: quote.deal_id?.toString() || '',
        valid_until: quote.valid_until || '',
        currency: quote.currency || 'USD',
        notes: quote.notes || '',
        items: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
        })),
    });

    transform((data) => ({
        ...data,
        account_id: data.account_id || null,
        contact_id: data.contact_id || null,
        deal_id: data.deal_id || null,
    }));

    const [totals, setTotals] = useState({ subtotal: 0, total: 0 });

    useEffect(() => {
        const subtotal = data.items.reduce(
            (acc, item) =>
                acc + Number(item.quantity) * Number(item.unit_price),
            0,
        );
        setTotals({ subtotal, total: subtotal });
    }, [data.items]);

    const addItem = () => {
        setData('items', [
            ...data.items,
            { description: '', quantity: 1, unit_price: 0, subtotal: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].subtotal =
                Number(newItems[index].quantity) *
                Number(newItems[index].unit_price);
        }
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/quotes/${quote.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Quote - ${quote.subject}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Quote</h1>
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
                                        Quote Subject{' '}
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
                                <CardTitle>Quote Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="deal_id">
                                        Related Deal
                                    </Label>
                                    <Select
                                        value={data.deal_id}
                                        onValueChange={(val) =>
                                            setData('deal_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select deal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {deals.map((deal) => (
                                                <SelectItem
                                                    key={deal.id}
                                                    value={deal.id.toString()}
                                                >
                                                    {deal.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="valid_until">
                                            Valid Until
                                        </Label>
                                        <Input
                                            id="valid_until"
                                            type="date"
                                            value={data.valid_until}
                                            onChange={(e) =>
                                                setData(
                                                    'valid_until',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">
                                            Currency
                                        </Label>
                                        <Select
                                            value={data.currency}
                                            onValueChange={(val) =>
                                                setData('currency', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">
                                                    USD
                                                </SelectItem>
                                                <SelectItem value="EUR">
                                                    EUR
                                                </SelectItem>
                                                <SelectItem value="TRY">
                                                    TRY
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>Line Items</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="grid flex-1 grid-cols-12 gap-4">
                                            <div className="col-span-6 grid gap-1.5">
                                                <Label className="ml-1 text-[10px] font-bold text-neutral-500 uppercase">
                                                    Description
                                                </Label>
                                                <Input
                                                    placeholder="Item description"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="col-span-2 grid gap-1.5">
                                                <Label className="ml-1 text-[10px] font-bold text-neutral-500 uppercase">
                                                    Quantity
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="col-span-2 grid gap-1.5">
                                                <Label className="ml-1 text-[10px] font-bold text-neutral-500 uppercase">
                                                    Unit Price
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            'unit_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="col-span-2 grid gap-1.5 pr-2 text-right">
                                                <Label className="mr-1 text-[10px] font-bold text-neutral-500 uppercase">
                                                    Subtotal
                                                </Label>
                                                <div className="flex h-10 items-center justify-end font-bold">
                                                    {(
                                                        item.quantity *
                                                        item.unit_price
                                                    ).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-7">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                disabled={
                                                    data.items.length === 1
                                                }
                                                className="text-neutral-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end border-t pt-8">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {totals.subtotal.toFixed(2)}{' '}
                                            {data.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                        <span>Total</span>
                                        <span>
                                            {totals.total.toFixed(2)}{' '}
                                            {data.currency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Add any notes or terms and conditions..."
                                className="min-h-[100px]"
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
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
