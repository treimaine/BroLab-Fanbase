/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as artistBilling from "../artistBilling.js";
import type * as artists from "../artists.js";
import type * as downloads from "../downloads.js";
import type * as downloads_helpers from "../downloads_helpers.js";
import type * as events from "../events.js";
import type * as feed from "../feed.js";
import type * as files from "../files.js";
import type * as follows from "../follows.js";
import type * as links from "../links.js";
import type * as orders from "../orders.js";
import type * as paymentMethods from "../paymentMethods.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as stripeConnect from "../stripeConnect.js";
import type * as subscriptions from "../subscriptions.js";
import type * as test_webhook_flow from "../test_webhook_flow.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  artistBilling: typeof artistBilling;
  artists: typeof artists;
  downloads: typeof downloads;
  downloads_helpers: typeof downloads_helpers;
  events: typeof events;
  feed: typeof feed;
  files: typeof files;
  follows: typeof follows;
  links: typeof links;
  orders: typeof orders;
  paymentMethods: typeof paymentMethods;
  products: typeof products;
  seed: typeof seed;
  stripe: typeof stripe;
  stripeConnect: typeof stripeConnect;
  subscriptions: typeof subscriptions;
  test_webhook_flow: typeof test_webhook_flow;
  users: typeof users;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
