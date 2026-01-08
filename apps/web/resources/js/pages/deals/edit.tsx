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
import AppLayout from '@/layouts/app-layout';
import { Account, BreadcrumbItem, Contact, Deal, Pipeline } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    deal: Deal;
    accounts: Account[];
    contacts: Contact[];
    pipelines: Pipeline[];
}

export default function Edit({ deal, accounts, contacts, pipelines }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Deals',
            href: '/deals',
        },
        {
            title: deal.name,
            href: `/deals/${deal.id}`,
        },
        {
            title: 'Edit',
            href: `/deals/${deal.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        pipeline_id: string;
        pipeline_stage_id: string;
        account_id: string;
        contact_id: string;
        value: number;
        currency: string;
        expected_close_date: string;
    }>({
        name: deal.name,
        pipeline_id: deal.pipeline_id.toString(),
        pipeline_stage_id: deal.pipeline_stage_id.toString(),
        account_id: deal.account_id?.toString() || 'none',
        contact_id: deal.contact_id?.toString() || 'none',
        value: Number(deal.value),
        currency: deal.currency,
        expected_close_date: deal.expected_close_date || '',
    });

    const currentPipeline = pipelines.find(
        (p) => p.id.toString() === data.pipeline_id,
    );

    useEffect(() => {
        if (
            currentPipeline &&
            !currentPipeline.stages.find(
                (s) => s.id.toString() === data.pipeline_stage_id,
            )
        ) {
            setData(
                'pipeline_stage_id',
                currentPipeline.stages[0]?.id.toString() || '',
            );
        }
    }, [data.pipeline_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/deals/${deal.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${deal.name}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Deal</h1>
                </div>

                <form onSubmit={submit} className="space-y-6 pb-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Deal Name{' '}
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
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Deal Value</Label>
                                    <div className="flex">
                                        <Input
                                            id="value"
                                            type="number"
                                            value={data.value}
                                            onChange={(e) =>
                                                setData(
                                                    'value',
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="rounded-r-none"
                                        />
                                        <div className="w-24">
                                            <Select
                                                value={data.currency}
                                                onValueChange={(val) =>
                                                    setData('currency', val)
                                                }
                                            >
                                                <SelectTrigger className="rounded-l-none border-l-0">
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
                                    <InputError message={errors.value} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="expected_close_date">
                                        Expected Close Date
                                    </Label>
                                    <Input
                                        id="expected_close_date"
                                        type="date"
                                        value={data.expected_close_date}
                                        onChange={(e) =>
                                            setData(
                                                'expected_close_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.expected_close_date}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Relationships & Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <div className="grid gap-2">
                                    <Label htmlFor="contact_id">
                                        Contact (Person)
                                    </Label>
                                    <SearchableSelect
                                        options={contacts.map((c) => ({
                                            value: c.id.toString(),
                                            label: `${c.first_name} ${c.last_name}`,
                                        }))}
                                        value={data.contact_id}
                                        onValueChange={(val) =>
                                            setData('contact_id', val)
                                        }
                                        placeholder="Select contact"
                                        noneLabel="None"
                                    />
                                    <InputError message={errors.contact_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="pipeline_id">
                                        Pipeline{' '}
                                        <span className="ml-0.5 text-red-500">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.pipeline_id}
                                        onValueChange={(val) =>
                                            setData('pipeline_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pipelines.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id.toString()}
                                                >
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.pipeline_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pipeline_stage_id">
                                        Stage{' '}
                                        <span className="ml-0.5 text-red-500">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.pipeline_stage_id}
                                        onValueChange={(val) =>
                                            setData('pipeline_stage_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentPipeline?.stages.map(
                                                (s) => (
                                                    <SelectItem
                                                        key={s.id}
                                                        value={s.id.toString()}
                                                    >
                                                        {s.name} (
                                                        {s.probability}%)
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.pipeline_stage_id}
                                    />
                                </div>
                            </div>
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
