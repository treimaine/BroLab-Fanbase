/**
 * Email Button Component
 * 
 * Lavender gradient CTA button for email templates.
 * Uses inline styles for maximum email client compatibility.
 * 
 * Requirements: R-EMAIL-3
 */

import { Link } from '@react-email/components';
import { ReactNode } from 'react';

export interface ButtonProps {
  /**
   * URL the button links to
   */
  readonly href: string;
  
  /**
   * Button text/content
   */
  readonly children: ReactNode;
}

/**
 * Shared button component for email CTAs
 * 
 * Features:
 * - Lavender gradient background (#a78bfa to #8b5cf6)
 * - White text with bold weight
 * - Rounded corners (8px)
 * - Padding for comfortable click target
 * - No text decoration
 * 
 * @example
 * ```tsx
 * <Button href="https://app.brolab.fan/dashboard">
 *   View Dashboard
 * </Button>
 * ```
 */
export function Button({ href, children }: ButtonProps) {
  return (
    <Link href={href} style={styles.button}>
      {children}
    </Link>
  );
}

/**
 * Inline styles for email compatibility
 * Using inline styles ensures consistent rendering across email clients
 */
const styles = {
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#a78bfa',
    backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center' as const,
    cursor: 'pointer',
  },
};

export default Button;
