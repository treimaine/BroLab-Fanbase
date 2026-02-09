/**
 * Email Footer Component
 * 
 * Shared footer for all email templates with tagline, support contact, and copyright.
 * Uses inline styles for maximum email client compatibility.
 * 
 * Requirements: R-EMAIL-3
 */

import { Section, Text } from '@react-email/components';

/**
 * Shared footer component for email templates
 * 
 * Features:
 * - Tagline: "Your career isn't an algorithm."
 * - Support contact email with link
 * - Copyright notice
 * - Centered layout with muted colors
 * 
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Section style={styles.footer}>
      <Text style={styles.tagline}>
        Your career isn&apos;t an algorithm.
      </Text>
      <Text style={styles.support}>
        Need help? Contact us at{' '}
        <a href="mailto:support@brolab.fan" style={styles.link}>
          support@brolab.fan
        </a>
      </Text>
      <Text style={styles.copyright}>
        © {currentYear} BroLab Fanbase. All rights reserved.
      </Text>
    </Section>
  );
}

/**
 * Inline styles for email compatibility
 * Using inline styles ensures consistent rendering across email clients
 */
const styles = {
  footer: {
    textAlign: 'center' as const,
    paddingTop: '24px',
    paddingBottom: '32px',
  },
  tagline: {
    fontSize: '14px',
    color: '#a1a1aa',
    margin: '0 0 12px 0',
    fontStyle: 'italic' as const,
  },
  support: {
    fontSize: '12px',
    color: '#71717a',
    margin: '0 0 8px 0',
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
  },
  copyright: {
    fontSize: '12px',
    color: '#52525b',
    margin: 0,
  },
};

export default Footer;
