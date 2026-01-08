import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { BreadcrumbItem, User } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invitations',
        href: '/settings/invitations',
    },
];

interface Invitation {
    id: number;
    email: string;
    role: string;
    created_at: string;
}

interface InvitationsPageProps {
    users: User[];
    invitations: Invitation[];
}

export default function Invitations({
    users,
    invitations,
}: InvitationsPageProps) {
    const {
        data,
        setData,
        post,
        processing,
        recentlySuccessful,
        errors,
        reset,
    } = useForm({
        email: '',
        role: 'Member',
    });

    const inviteUser: FormEventHandler = (e) => {
        e.preventDefault();
        post('/invitations', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invitations" />

            <SettingsLayout>
                <div className="space-y-12">
                    <div className="space-y-6">
                        <HeadingSmall
                            title="Invite Team Member"
                            description="Send an invitation to join your team."
                        />

                        <form
                            onSubmit={inviteUser}
                            className="flex max-w-2xl flex-col items-end gap-4 sm:flex-row"
                        >
                            <div className="grid w-full flex-1 gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    placeholder="colleague@example.com"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid w-full gap-2 sm:w-48">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) =>
                                        setData('role', value)
                                    }
                                >
                                    <SelectTrigger className="mt-1 w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="Member">
                                            Member
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.role}
                                    className="mt-2"
                                />
                            </div>

                            <div className="mb-0.5 flex items-center gap-4">
                                <Button disabled={processing}>Invite</Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        Invited
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {invitations.length > 0 && (
                        <div className="space-y-6">
                            <HeadingSmall
                                title="Pending Invitations"
                                description="People who have been invited but haven't joined yet."
                            />
                            <div className="max-w-2xl rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">
                                                Sent
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((invitation) => (
                                            <TableRow key={invitation.id}>
                                                <TableCell className="font-medium">
                                                    {invitation.email}
                                                </TableCell>
                                                <TableCell>
                                                    {invitation.role}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {new Date(
                                                        invitation.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-neutral-500 hover:text-red-600"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to revoke this invitation?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/invitations/${invitation.id}`,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <HeadingSmall
                            title="Team Members"
                            description="Existing team members in your company."
                        />

                        <div className="max-w-2xl rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">
                                            Joined
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.roles &&
                                                user.roles.length > 0
                                                    ? user.roles[0].name
                                                    : 'No Role'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
