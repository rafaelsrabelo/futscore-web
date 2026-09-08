import type { Athlete } from "@/lib/types";
import { Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

interface PlayerSocialLinksProps {
  athlete: Athlete;
}

export function PlayerSocialLinks({ athlete }: PlayerSocialLinksProps) {
  const links = [
    {
      href: athlete.instagramUrl,
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: athlete.twitterUrl,
      icon: Twitter,
      label: "Twitter",
    },
    {
      href: athlete.youtubeUrl,
      icon: Youtube,
      label: "YouTube",
    },
  ].filter((link) => link.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {links.map(({ href, icon: Icon, label }) => (
        <Link
          key={label}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
        >
          <Icon className="w-4 h-4" />
        </Link>
      ))}
    </div>
  );
}
