/**
 * Waitlist Confirmation Email Template
 * 
 * Sent to users after they successfully join the waitlist.
 * Confirms their spot and provides information about what's coming.
 * 
 * Requirements: R-EMAIL-3
 */

import { Section } from '@react-email/components';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Text } from '../components/Text';

export interface WaitlistConfirmationProps {
  /**
   * Recipient email address (for personalization if needed)
   */
  readonly email: string;
}

/**
 * Waitlist confirmation email template
 * 
 * Content includes:
 * - Welcome message with emoji
 * - Confirmation of waitlist spot
 * - List of upcoming features
 * - CTA to visit BroLab
 * - Footer with tagline and support
 * 
 * @example
 * ```tsx
 * <WaitlistConfirmation email="artist@example.com" />
 * ```
 */
export function WaitlistConfirmation({ email }: WaitlistConfirmationProps) {
  return (
    <Layout previewText="You're on the BroLab Waitlist! 🎵">
      {/* Welcome Heading */}
      <Text variant="heading" style={{ textAlign: 'center', marginBottom: '24px' }}>
        Welcome to BroLab 🎵
      </Text>

      {/* Confirmation Message */}
      <Text variant="body">
        You&apos;re officially on the waitlist! We&apos;re building something special for artists who want to own their connection with fans.
      </Text>

      {/* Features Section */}
      <Text variant="body" style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#ffffff' }}>What&apos;s coming:</strong>
      </Text>

      <ul style={styles.featureList}>
        <li style={styles.featureItem}>Your own hub - one link for everything</li>
        <li style={styles.featureItem}>Direct sales to fans - music, merch, tickets</li>
        <li style={styles.featureItem}>Instant payouts via Stripe Connect</li>
        <li style={styles.featureItem}>Zero platform fees on your revenue</li>
      </ul>

      {/* Next Steps */}
      <Text variant="body" style={{ marginBottom: '32px' }}>
        We&apos;ll notify you as soon as your spot opens up. In the meantime, follow us on socials for updates.
      </Text>

      {/* CTA Button */}
      <Section style={styles.buttonContainer}>
        <Button href="https://app.brolabentertainment.com">
          Visit BroLab
        </Button>
      </Section>
    </Layout>
  );
}

/**
 * Inline styles for email compatibility
 * Using inline styles ensures consistent rendering across email clients
 */
const styles = {
  featureList: {
    margin: '0 0 24px 0',
    paddingLeft: '20px',
    color: '#e4e4e7',
    fontSize: '16px',
    lineHeight: '1.8',
  },
  featureItem: {
    marginBottom: '8px',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    paddingTop: '8px',
  },
};

export default WaitlistConfirmation;
