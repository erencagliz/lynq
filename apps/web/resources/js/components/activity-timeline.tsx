import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { FileText, Mail, Phone, Trash2, Users } from 'lucide-react';

interface Activity {
    id: number;
    type: 'note' | 'call' | 'email' | 'meeting';
    description: string;
    performed_at: string;
    user?: {
        name: string;
        profile_photo_url?: string;
    };
    created_at: string;
}

interface Props {
    activities: Activity[];
    subjectType: string;
    subjectId: number;
}

export default function ActivityTimeline({
    activities,
    subjectType,
    subjectId,
}: Props) {
    const { data, setData, post, processing, reset } = useForm({
        subject_type: subjectType,
        subject_id: subjectId,
        type: 'note', // default
        description: '',
        performed_at: new Date().toISOString(),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/activities', {
            onSuccess: () => reset('description'),
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/activities/${id}`, { preserveScroll: true });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="h-4 w-4" />;
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'meeting':
                return <Users className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'call':
                return 'bg-green-100 text-green-700';
            case 'email':
                return 'bg-blue-100 text-blue-700';
            case 'meeting':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="overflow-hidden rounded border bg-white shadow-sm">
            <div className="flex h-10 items-center justify-between border-b bg-neutral-50 px-4">
                <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-neutral-900 uppercase">
                    <FileText className="h-4 w-4 text-neutral-400" /> Activity
                    Timeline ({activities.length})
                </h2>
            </div>
            <div className="space-y-8 p-4">
                <div className="rounded border border-neutral-100 bg-neutral-50/50 p-4">
                    <Tabs
                        defaultValue="note"
                        onValueChange={(val) => setData('type', val)}
                        className="w-full"
                    >
                        <TabsList className="mb-4 grid w-full grid-cols-4">
                            <TabsTrigger
                                value="note"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" /> Note
                            </TabsTrigger>
                            <TabsTrigger
                                value="call"
                                className="flex items-center gap-2"
                            >
                                <Phone className="h-4 w-4" /> Call
                            </TabsTrigger>
                            <TabsTrigger
                                value="email"
                                className="flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" /> Email
                            </TabsTrigger>
                            <TabsTrigger
                                value="meeting"
                                className="flex items-center gap-2"
                            >
                                <Users className="h-4 w-4" /> Meeting
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={submit} className="space-y-4">
                            <Textarea
                                placeholder="Write a note, functionality description, or log a call..."
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="min-h-[100px] bg-white"
                                required
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    size="sm"
                                >
                                    Log Activity
                                </Button>
                            </div>
                        </form>
                    </Tabs>
                </div>

                <div className="relative space-y-8 border-l border-neutral-200 pl-6">
                    {activities.map((activity) => (
                        <div key={activity.id} className="group relative">
                            <span
                                className={`absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${getBgColor(activity.type)}`}
                            >
                                {getIcon(activity.type)}
                            </span>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {activity.user?.name || 'User'}
                                    </span>
                                    <span className="text-xs text-neutral-500">
                                        {format(
                                            new Date(activity.created_at),
                                            'MMM d, h:mm a',
                                        )}
                                    </span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap text-neutral-700">
                                    {activity.description}
                                </div>
                                <button
                                    onClick={() => handleDelete(activity.id)}
                                    className="absolute top-0 right-0 rounded p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100"
                                    title="Delete activity"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {activities.length === 0 && (
                        <div className="py-4 text-center">
                            <p className="text-sm text-neutral-400 italic">
                                No activities recorded yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
