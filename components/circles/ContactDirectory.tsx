"use client";

import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { getVisibleContact, type ContactField } from "@/lib/contactDirectory";

interface DirectoryParticipant {
    address: string;
}

interface ContactDirectoryProps {
    participants: DirectoryParticipant[];
    viewerIsMember: boolean;
    viewerAddress: string;
}

function formatAddress(address: string) {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function ContactIcon({ field }: { field: ContactField }) {
    return field === "email" ? <Mail size={14} aria-hidden="true" /> : <MessageCircle size={14} aria-hidden="true" />;
}

export default function ContactDirectory({
    participants,
    viewerIsMember,
    viewerAddress,
}: ContactDirectoryProps) {
    if (!viewerIsMember) return null;

    const visibleContacts = participants.flatMap((participant) => {
        const contact = getVisibleContact({
            viewerIsMember,
            participantAddress: participant.address,
            participantIsMember: true,
        });
        return contact ? [{ participant, contact }] : [];
    });

    return (
        <section aria-labelledby="contact-directory-heading" className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6">
            <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#4B6B76]" aria-hidden="true" />
                <div>
                    <h2 id="contact-directory-heading" className="text-lg font-bold font-sora text-[var(--text)]">
                        Member contact directory
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                        Only contact details shared by members of this circle appear here. Wallet addresses remain separate and unchanged.
                    </p>
                </div>
            </div>

            {visibleContacts.length > 0 ? (
                <div className="mt-5 space-y-2">
                    {visibleContacts.map(({ participant, contact }) => (
                        <div key={participant.address} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ov-10)] bg-[var(--modal)] px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                    {participant.address.toLowerCase() === viewerAddress.toLowerCase() ? "You" : formatAddress(participant.address)}
                                </p>
                                <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">{formatAddress(participant.address)}</p>
                            </div>
                            <span className="inline-flex min-w-0 items-center gap-1.5 break-all text-right text-sm text-[var(--text)]">
                                <ContactIcon field={contact.field} />
                                {contact.value}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-5 text-sm text-[var(--muted)]">No members have opted to share contact details.</p>
            )}
        </section>
    );
}