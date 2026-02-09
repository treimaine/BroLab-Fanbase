/**
 * Email Template Registry and Rendering Utilities
 * 
 * This module provides a centralized registry for email templates
 * and utilities for rendering React Email components to HTML.
 * 
 * Requirements: R-EMAIL-3, R-EMAIL-4
 */

import { render } from '@react-email/render';
import { ReactElement } from 'react';
import WaitlistConfirmation, { WaitlistConfirmationProps } from './templates/WaitlistConfirmation';

/**
 * Template identifiers for all transactional emails
 * Requirement: R-EMAIL-4
 */
export type TemplateId =
  | 'waitlist_confirmation'
  | 'purchase_receipt'
  | 'download_ready'
  | 'follow_notification'
  | 'product_launch'
  | 'event_reminder';

/**
 * Email render result containing subject, HTML, and optional plain text
 * Requirement: R-EMAIL-4
 */
export interface EmailRenderResult {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Props type mapping for each template
 */
interface TemplatePropsMap {
  waitlist_confirmation: WaitlistConfirmationProps;
  purchase_receipt: { orderId: string; total: number };
  download_ready: { productTitle: string; downloadUrl: string };
  follow_notification: { artistName: string; artistSlug: string };
  product_launch: { productTitle: string; artistName: string };
  event_reminder: { eventTitle: string; eventDate: string; venue: string };
}

/**
 * Template configuration with component, subject, and optional text generator
 */
interface TemplateConfig<T extends TemplateId> {
  component: (props: TemplatePropsMap[T]) => ReactElement;
  subject: (props: TemplatePropsMap[T]) => string;
  text?: (props: TemplatePropsMap[T]) => string;
}

/**
 * Email template registry
 * Maps template IDs to their React components and subject generators
 * Requirement: R-EMAIL-4
 */
const emailTemplates: {
  [K in TemplateId]?: TemplateConfig<K>;
} = {
  waitlist_confirmation: {
    component: WaitlistConfirmation,
    subject: () => "You're on the BroLab Waitlist! 🎵",
    text: () => "Welcome to BroLab! You're on the waitlist. We'll notify you when your spot opens up. What's coming: Your own hub - one link for everything. Direct sales to fans - music, merch, tickets. Instant payouts via Stripe Connect. Zero platform fees on your revenue. Visit us at https://app.brolabentertainment.com",
  },
  // Future templates will be added here
  // purchase_receipt: { component: PurchaseReceipt, subject: (props) => `Receipt for ${props.orderId}` },
  // download_ready: { component: DownloadReady, subject: (props) => `Your download is ready: ${props.productTitle}` },
  // follow_notification: { component: FollowNotification, subject: (props) => `${props.artistName} just followed you!` },
  // product_launch: { component: ProductLaunch, subject: (props) => `New release from ${props.artistName}` },
  // event_reminder: { component: EventReminder, subject: (props) => `Reminder: ${props.eventTitle}` },
};

/**
 * Render an email template to HTML, plain text, and subject
 * 
 * This is the main function for rendering transactional emails.
 * It returns a complete email object ready to be sent via email service.
 * 
 * Requirement: R-EMAIL-4
 * 
 * @param templateId - The template identifier
 * @param props - Props specific to the template
 * @returns Email render result with subject, HTML, and optional plain text
 * 
 * @example
 * ```ts
 * const email = await renderEmail('waitlist_confirmation', { email: 'user@example.com' });
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: email.subject,
 *   html: email.html,
 *   text: email.text,
 * });
 * ```
 */
export async function renderEmail<T extends TemplateId>(
  templateId: T,
  props: TemplatePropsMap[T]
): Promise<EmailRenderResult> {
  const template = emailTemplates[templateId];
  
  if (!template) {
    throw new Error(`Email template "${templateId}" not found in registry`);
  }

  // Generate subject line
  const subject = template.subject(props);

  // Render HTML version
  const element = template.component(props);
  const html = await render(element, {
    pretty: process.env.NODE_ENV === 'development',
  });

  // Use custom plain text if provided, otherwise auto-generate from HTML
  // Custom plain text provides better control over the message
  // Requirement: R-EMAIL-3
  let text: string;
  if (template.text) {
    text = template.text(props);
  } else {
    // Fallback to automatic plain text conversion
    text = await render(element, {
      plainText: true,
    });
  }

  return {
    subject,
    html,
    text,
  };
}

/**
 * Check if a template is registered
 * 
 * @param templateId - The template identifier to check
 * @returns True if the template is registered
 */
export function isTemplateRegistered(templateId: TemplateId): boolean {
  return emailTemplates[templateId] !== undefined;
}

/**
 * Get all registered template identifiers
 * 
 * @returns Array of registered template identifiers
 */
export function getRegisteredTemplates(): TemplateId[] {
  return Object.keys(emailTemplates) as TemplateId[];
}
