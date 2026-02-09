/**
 * Email Text Component
 * 
 * Shared typography component for email templates with consistent styling.
 * Supports multiple variants for different text hierarchies.
 * 
 * Requirements: R-EMAIL-3
 */

import { Text as ReactEmailText } from '@react-email/components';
import { CSSProperties, ReactNode } from 'react';

export interface TextProps {
  /**
   * Typography variant
   * - heading: Large, bold text for titles
   * - body: Regular text for main content
   * - muted: Smaller, lighter text for secondary content
   */
  readonly variant?: 'heading' | 'body' | 'muted';
  
  /**
   * Text content
   */
  readonly children: ReactNode;
  
  /**
   * Optional custom styles to override defaults
   */
  readonly style?: CSSProperties;
}

/**
 * Shared text component for email typography
 * 
 * Provides consistent text styling across all email templates:
 * - heading: 24px, bold, white (#ffffff)
 * - body: 16px, regular, light gray (#e4e4e7)
 * - muted: 14px, regular, muted gray (#a1a1aa)
 * 
 * @example
 * ```tsx
 * <Text variant="heading">Welcome to BroLab Fanbase</Text>
 * <Text variant="body">Your account has been created successfully.</Text>
 * <Text variant="muted">This email was sent to you because...</Text>
 * ```
 */
export function Text({ variant = 'body', children, style }: TextProps) {
  const variantStyle = styles[variant];
  const combinedStyle = { ...variantStyle, ...style };

  return (
    <ReactEmailText style={combinedStyle}>
      {children}
    </ReactEmailText>
  );
}

/**
 * Inline styles for email compatibility
 * Using inline styles ensures consistent rendering across email clients
 */
const styles: Record<'heading' | 'body' | 'muted', CSSProperties> = {
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },
  body: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#e4e4e7',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  muted: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#a1a1aa',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
};

export default Text;
