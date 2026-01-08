import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Pipelines',
        href: '/pipelines',
    },
    {
        title: 'New Pipeline',
        href: '/pipelines/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        stages: { name: string; probability: number }[];
    }>({
        name: '',
        stages: [
            { name: 'Prospecting', probability: 10 },
            { name: 'Qualification', probability: 20 },
            { name: 'Proposal', probability: 50 },
            { name: 'Negotiation', probability: 80 },
            { name: 'Closed Won', probability: 100 },
            { name: 'Closed Lost', probability: 0 },
        ],
    });

    const addStage = () => {
        setData('stages', [...data.stages, { name: '', probability: 0 }]);
    };

    const removeStage = (index: number) => {
        if (data.stages.length > 1) {
            const newStages = [...data.stages];
            newStages.splice(index, 1);
            setData('stages', newStages);
        }
    };

    const updateStage = (
        index: number,
        field: 'name' | 'probability',
        value: any,
    ) => {
        const newStages = [...data.stages];
        const stage = newStages[index];
        if (field === 'probability') {
            stage.probability = parseInt(value) || 0;
        } else {
            stage.name = value;
        }
        setData('stages', newStages);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/pipelines');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pipeline" />

            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">New Pipeline</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Pipeline Name{' '}
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
                                    placeholder="e.g. Sales, Recruiting, Renewals"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>Stages</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addStage}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stage
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.stages.map((stage, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center gap-4"
                                >
                                    <div className="cursor-grab text-neutral-400">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="grid flex-1 grid-cols-12 gap-4">
                                        <div className="col-span-8">
                                            <Input
                                                value={stage.name}
                                                onChange={(e) =>
                                                    updateStage(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Stage Name"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={stage.probability}
                                                    onChange={(e) =>
                                                        updateStage(
                                                            index,
                                                            'probability',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pr-8"
                                                    min="0"
                                                    max="100"
                                                    required
                                                />
                                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-neutral-400">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStage(index)}
                                        className="text-neutral-400 hover:text-red-500"
                                        disabled={data.stages.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <InputError message={errors.stages} />
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
                            Create Pipeline
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
