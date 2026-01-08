import { Icon } from '@/components/icon';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef, useState } from 'react';
import { InviteModal } from './invite-modal';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            >
                                {item.title === 'Invite' ? (
                                    <button
                                        onClick={() =>
                                            setIsInviteModalOpen(true)
                                        }
                                    >
                                        {item.icon && (
                                            <Icon
                                                iconNode={item.icon}
                                                className="h-5 w-5"
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </button>
                                ) : (
                                    <a
                                        href={resolveUrl(item.href)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.icon && (
                                            <Icon
                                                iconNode={item.icon}
                                                className="h-5 w-5"
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </a>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
            <InviteModal
                open={isInviteModalOpen}
                onOpenChange={setIsInviteModalOpen}
            />
        </SidebarGroup>
    );
}
