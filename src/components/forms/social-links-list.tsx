"use client";

import {
    AppleMusicIcon,
    FacebookIcon,
    InstagramIcon,
    SoundCloudIcon,
    SpotifyIcon,
    TikTokIcon,
    TwitchIcon,
    WebsiteIcon,
    XTwitterIcon,
    YouTubeIcon,
} from "@/components/icons/social-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Supported social platforms with their metadata
 */
export const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    placeholder: "https://instagram.com/yourhandle",
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    icon: XTwitterIcon,
    placeholder: "https://x.com/yourhandle",
    urlPattern: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/i,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: YouTubeIcon,
    placeholder: "https://youtube.com/@yourchannel",
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/.+/i,
  },
  {
    id: "spotify",
    label: "Spotify",
    icon: SpotifyIcon,
    placeholder: "https://open.spotify.com/artist/...",
    urlPattern: /^https?:\/\/open\.spotify\.com\/.+/i,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: TikTokIcon,
    placeholder: "https://tiktok.com/@yourhandle",
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/.+/i,
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    icon: SoundCloudIcon,
    placeholder: "https://soundcloud.com/yourhandle",
    urlPattern: /^https?:\/\/(www\.)?soundcloud\.com\/.+/i,
  },
  {
    id: "applemusic",
    label: "Apple Music",
    icon: AppleMusicIcon,
    placeholder: "https://music.apple.com/artist/...",
    urlPattern: /^https?:\/\/music\.apple\.com\/.+/i,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    placeholder: "https://facebook.com/yourpage",
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  },
  {
    id: "twitch",
    label: "Twitch",
    icon: TwitchIcon,
    placeholder: "https://twitch.tv/yourchannel",
    urlPattern: /^https?:\/\/(www\.)?twitch\.tv\/.+/i,
  },
  {
    id: "website",
    label: "Website",
    icon: WebsiteIcon,
    placeholder: "https://yourwebsite.com",
    urlPattern: /^https?:\/\/.+/i,
  },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];

export interface SocialLink {
  platform: string;
  url: string;
  active: boolean;
}

interface SocialLinksListProps {
  readonly socials: SocialLink[];
  readonly onChange: (socials: SocialLink[]) => void;
  readonly disabled?: boolean;
}

/**
 * SocialLinksList Component
 * Requirements: 5.3 - Social links list with toggle switches (on/off)
 *
 * Features:
 * - List of supported social platforms
 * - URL input for each platform
 * - Switch toggle to enable/disable each link
 * - Visual feedback for active/inactive state
 */
export function SocialLinksList({
  socials,
  onChange,
  disabled = false,
}: SocialLinksListProps) {
  /**
   * Get the current social link data for a platform
   */
  const getSocialByPlatform = (platformId: string): SocialLink | undefined => {
    return socials.find((s) => s.platform === platformId);
  };

  /**
   * Handle URL change for a platform
   */
  const handleUrlChange = (platformId: string, url: string) => {
    const existingIndex = socials.findIndex((s) => s.platform === platformId);

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...socials];
      updated[existingIndex] = { ...updated[existingIndex], url };
      onChange(updated);
    } else {
      // Add new
      onChange([...socials, { platform: platformId, url, active: false }]);
    }
  };

  /**
   * Handle toggle change for a platform
   */
  const handleToggle = (platformId: string, active: boolean) => {
    const existingIndex = socials.findIndex((s) => s.platform === platformId);

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...socials];
      updated[existingIndex] = { ...updated[existingIndex], active };
      onChange(updated);
    } else {
      // Add new with empty URL (will need URL to be useful)
      onChange([...socials, { platform: platformId, url: "", active }]);
    }
  };

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Social Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const social = getSocialByPlatform(platform.id);
            const isActive = social?.active ?? false;
            const url = social?.url ?? "";
            const Icon = platform.icon;

            return (
              <div
                key={platform.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-muted/30"
                )}
              >
                {/* Platform Icon & Label */}
                <div className="flex w-32 shrink-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <Label
                    htmlFor={`social-${platform.id}`}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {platform.label}
                  </Label>
                </div>

                {/* URL Input */}
                <div className="flex-1">
                  <Input
                    id={`social-${platform.id}`}
                    type="url"
                    placeholder={platform.placeholder}
                    value={url}
                    onChange={(e) =>
                      handleUrlChange(platform.id, e.target.value)
                    }
                    disabled={disabled}
                    className={cn(
                      "h-9 text-sm",
                      !isActive && "opacity-60"
                    )}
                  />
                </div>

                {/* Toggle Switch */}
                <div className="shrink-0">
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) =>
                      handleToggle(platform.id, checked)
                    }
                    disabled={disabled}
                    aria-label={`Toggle ${platform.label}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Toggle on the platforms you want to display on your public hub. Only
          active links with valid URLs will be shown.
        </p>
      </CardContent>
    </Card>
  );
}
