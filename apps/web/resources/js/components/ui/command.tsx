"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

function Command({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn(
                "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
                className
            )}
            {...props}
        />
    )
}

function CommandDialog({ children, ...props }: DialogProps) {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
                <Command className="[&_[data-target=input-wrapper]_svg]:size-5 [&_[data-target=input-wrapper]]:h-12 [&_[data-target=item]]:px-5 [&_[data-target=item]]:py-3 [&_[data-target=group-heading]]:px-5 [&_[data-target=group]:not([hidden])_~[data-target=group]]:pt-0 [&_[data-target=group]]:px-2 [&_[data-target=input]]:p-0">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div
            className="flex items-center border-b px-3"
            data-target="input-wrapper"
        >
            <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    )
}

function CommandList({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    )
}

function CommandEmpty({
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className="py-6 text-center text-sm"
            {...props}
        />
    )
}

function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={cn(
                "text-foreground [&_[data-target=group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[data-target=group-heading]]:px-2 [&_[data-target=group-heading]]:py-1.5 [&_[data-target=group-heading]]:text-xs [&_[data-target=group-heading]]:font-medium",
                className
            )}
            {...props}
        />
    )
}

function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn("bg-border -mx-1 h-px", className)}
            {...props}
        />
    )
}

function CommandItem({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    )
}

function CommandShortcut({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            data-slot="command-shortcut"
            className={cn(
                "text-muted-foreground ml-auto text-xs tracking-widest",
                className
            )}
            {...props}
        />
    )
}

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
