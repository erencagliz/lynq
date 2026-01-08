import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectType: string;
    subjectId: number;
    users: User[];
}

export function TaskModal({
    isOpen,
    onClose,
    subjectType,
    subjectId,
    users,
}: TaskModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        type: 'Task',
        status: 'Pending',
        priority: 'Normal',
        due_date: '',
        assigned_to: 'none',
        description: '',
        taskable_type: subjectType,
        taskable_id: subjectId,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tasks', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="subject">
                                Subject <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                                placeholder="Follow up with client"
                            />
                            {errors.subject && (
                                <p className="text-sm text-red-500">{errors.subject}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Task Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(val) => setData('type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Task">Task</SelectItem>
                                    <SelectItem value="Call">Call</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Meeting">Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Deferred">Deferred</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={data.priority}
                                onValueChange={(val) => setData('priority', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="assigned_to">Assign To</Label>
                            <SearchableSelect
                                options={users.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.name,
                                }))}
                                value={data.assigned_to}
                                onValueChange={(val) => setData('assigned_to', val)}
                                placeholder="Select user"
                                noneLabel="Unassigned"
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add more details about the task..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
