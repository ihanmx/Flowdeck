"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import type { Invitation } from "../../types";

export function PendingInvitationRow({
  invitation,
}: {
  invitation: Invitation;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/invite/${invitation.token}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink">{invitation.email}</p>
        <p className="text-xs text-muted">
          {invitation.role.toLowerCase()} · expires{" "}
          {new Date(invitation.expiresAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={copyLink}
        className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-body transition hover:bg-canvas"
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </li>
  );
}
