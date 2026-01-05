/**
 * Shared TypeScript types for BroLab Fanbase
 */

export type UserRole = "artist" | "fan";

export interface User {
  id: string;
  clerkUserId: string;
  role: UserRole;
  displayName: string;
  usernameSlug: string;
  avatarUrl?: string;
}

export interface Social {
  platform: string;
  url: string;
  active: boolean;
}

export interface Artist {
  id: string;
  ownerUserId: string;
  artistSlug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socials: Social[];
}

export interface Link {
  id: string;
  artistId: string;
  title: string;
  url: string;
  type: string;
  active: boolean;
  order: number;
}

export interface Event {
  id: string;
  artistId: string;
  title: string;
  date: number;
  venue: string;
  city: string;
  ticketUrl?: string;
  imageUrl?: string;
  ticketsSold: number;
  revenue: number;
  status: "upcoming" | "sold-out" | "past";
}

export interface Product {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  type: "music" | "video";
  priceUSD: number;
  coverImageUrl?: string;
  visibility: "public" | "private";
  fileStorageId?: string;
  contentType?: string;
  fileSize?: number;
}

export interface Order {
  id: string;
  fanUserId: string;
  totalUSD: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  stripeSessionId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  type: "music" | "video";
  priceUSD: number;
  fileStorageId?: string;
}

export interface Follow {
  id: string;
  fanUserId: string;
  artistId: string;
}
