/**
 * Email Layout Component
 * 
 * Shared layout wrapper for all email templates with consistent branding.
 * Features dark background, card container, header with logo, and footer.
 * 
 * Requirements: R-EMAIL-3
 */

import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { ReactNode } from 'react';

export interface LayoutProps {
  /**
   * Email content to be rendered inside the layout
   */
  readonly children: ReactNode;
  
  /**
   * Preview text shown in email client inbox (before opening)
   * Max 150 characters recommended
   */
  readonly previewText: string;
}

/**
 * Shared email layout component
 * 
 * Provides consistent structure and branding across all email templates:
 * - Dark background (#0a0a0a)
 * - Card container (#141414)
 * - Header with BroLab Fanbase logo
 * - Footer with tagline and support contact
 * 
 * @example
 * ```tsx
 * <Layout previewText="Welcome to BroLab Fanbase!">
 *   <Text>Your email content here</Text>
 * </Layout>
 * ```
 */
export function Layout({ children, previewText }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header Section */}
          <Section style={styles.header}>
            <Text style={styles.logo}>BroLab Fanbase</Text>
          </Section>

          {/* Main Content Card */}
          <Section style={styles.card}>
            {children}
          </Section>

          {/* Footer Section */}
          <Section style={styles.footer}>
            <Text style={styles.tagline}>
              Your career isn&apos;t an algorithm.
            </Text>
            <Text style={styles.support}>
              Need help? Contact us at{' '}
              <a href="mailto:support@app.brolabentertainment.com" style={styles.link}>
                support@brolab.fan
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Inline styles for email compatibility
 * Using inline styles ensures consistent rendering across email clients
 */
const styles = {
  body: {
    backgroundColor: '#0a0a0a',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    paddingTop: '32px',
    paddingBottom: '24px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
  },
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
    margin: 0,
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
  },
};

export default Layout;
