# Email Deliverability Guide

## Overview

BroLab Fanbase uses [Resend](https://resend.com) as the email service provider for transactional emails (waitlist confirmations, order receipts, etc.). To ensure reliable email delivery, proper domain configuration is required.

## Domain Verification Requirement

**CRITICAL:** The domain `app.brolabentertainment.com` MUST be verified in the Resend dashboard before sending production emails.

### Why Domain Verification is Required

- **Deliverability**: Unverified domains have significantly lower delivery rates and may be flagged as spam
- **Sender Reputation**: Verified domains build trust with email providers (Gmail, Outlook, etc.)
- **DKIM/SPF**: Verification enables proper email authentication protocols
- **Production Readiness**: Resend requires domain verification for production email sending

### Verification Steps

1. **Access Resend Dashboard**
   - Log in to [Resend Dashboard](https://resend.com/dashboard)
   - Navigate to **Domains** section

2. **Add Domain**
   - Click "Add Domain"
   - Enter: `app.brolabentertainment.com`
   - Follow the verification wizard

3. **Configure DNS Records**
   - Resend will provide DNS records (TXT, MX, CNAME)
   - Add these records to your DNS provider (e.g., Vercel, Cloudflare, Namecheap)
   - Wait for DNS propagation (typically 5-60 minutes)

4. **Verify Domain**
   - Return to Resend dashboard
   - Click "Verify" on the domain
   - Status should change to "Verified" ✅

### DNS Records Example

Resend will provide records similar to:

```
Type: TXT
Name: _resend
Value: resend-verification=abc123xyz...

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**Note:** Actual values will be provided by Resend during setup.

## Required DNS Records for Email Authentication

To ensure maximum email deliverability and prevent spoofing, configure the following DNS records for `app.brolabentertainment.com`:

### SPF (Sender Policy Framework)

SPF specifies which mail servers are authorized to send emails on behalf of your domain.

```
Type: TXT
Name: @ (or app.brolabentertainment.com)
Value: v=spf1 include:_spf.resend.com ~all
```

**Explanation:**
- `v=spf1` - SPF version 1
- `include:_spf.resend.com` - Authorize Resend's mail servers
- `~all` - Soft fail for unauthorized servers (recommended for initial setup)

### DKIM (DomainKeys Identified Mail)

DKIM adds a digital signature to emails to verify they haven't been tampered with.

```
Type: TXT
Name: resend._domainkey (provided by Resend after domain verification)
Value: [DKIM key provided by Resend dashboard]
```

**Important:** The exact DKIM record name and value will be provided by Resend after you add and verify your domain in the Resend dashboard. This is unique to your domain and cannot be generated manually.

**Steps to get DKIM record:**
1. Add domain in Resend dashboard
2. Navigate to domain settings
3. Copy the DKIM record provided
4. Add to your DNS provider

### DMARC (Domain-based Message Authentication)

DMARC builds on SPF and DKIM to provide reporting and policy enforcement.

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@brolabentertainment.com
```

**Explanation:**
- `v=DMARC1` - DMARC version 1
- `p=none` - Policy: monitor only (no action taken on failures)
- `rua=mailto:dmarc@brolabentertainment.com` - Send aggregate reports to this email

**Policy Options:**
- `p=none` - Monitor mode (recommended for initial setup)
- `p=quarantine` - Move suspicious emails to spam
- `p=reject` - Reject emails that fail authentication (strictest)

**Recommendation:** Start with `p=none` to monitor reports, then gradually move to `p=quarantine` or `p=reject` once you're confident in your configuration.

### DNS Configuration Checklist

- [ ] SPF record added with `include:_spf.resend.com`
- [ ] DKIM record added (from Resend dashboard)
- [ ] DMARC record added with monitoring email
- [ ] DNS propagation verified (use https://dnschecker.org)
- [ ] Email authentication tested (use https://www.mail-tester.com)

### Verification Tools

After adding DNS records, verify they're correctly configured:

1. **SPF Check**: https://mxtoolbox.com/spf.aspx
2. **DKIM Check**: https://mxtoolbox.com/dkim.aspx
3. **DMARC Check**: https://mxtoolbox.com/dmarc.aspx
4. **Overall Email Test**: https://www.mail-tester.com (send test email, get score)

**Target Score:** Aim for 10/10 on mail-tester.com for optimal deliverability.

## Testing Email Delivery

### Development Mode

During development, you can use:
- Resend's test mode (emails sent to verified addresses only)
- Your personal email for testing
- Resend's email logs to debug delivery issues

### Test Mode Usage

Resend provides a test mode for development and testing without sending actual emails.

#### How Test Mode Works

- **No Actual Delivery**: Emails sent in test mode are NOT actually delivered to recipients
- **API Simulation**: The API responds successfully (200 OK) but no email is sent
- **Dashboard Visibility**: Test emails appear in the Resend dashboard with "Test" badge
- **Safe Testing**: Prevents accidental emails to real users during development

#### Test Email Addresses

Resend provides special test email addresses that can be used to simulate different scenarios:

```
test+<tag>@resend.dev
```

**Examples:**
- `test+success@resend.dev` - Simulates successful delivery
- `test+bounce@resend.dev` - Simulates bounce
- `test+complaint@resend.dev` - Simulates spam complaint
- `test+waitlist@resend.dev` - Custom tag for waitlist testing

**Usage in Code:**
```typescript
// Development/Test environment
const testEmail = "test+waitlist@resend.dev";

await resend.emails.send({
  from: "noreply@app.brolabentertainment.com",
  to: testEmail,
  subject: "Welcome to BroLab Fanbase",
  html: "<p>Thank you for joining our waitlist!</p>",
});
```

#### Verifying Delivery in Resend Dashboard

1. **Access Dashboard**
   - Log in to [Resend Dashboard](https://resend.com/dashboard)
   - Navigate to **Emails** section

2. **View Test Emails**
   - Test emails are marked with a "Test" badge
   - Click on any email to view details:
     - Recipient address
     - Subject line
     - Timestamp
     - Delivery status
     - Email content (HTML/Text preview)

3. **Check Delivery Status**
   - **Delivered**: Email was successfully processed (test mode)
   - **Bounced**: Simulated bounce (if using `test+bounce@resend.dev`)
   - **Complained**: Simulated spam complaint (if using `test+complaint@resend.dev`)

4. **Debug Information**
   - View full email headers
   - Check API request/response
   - Review error messages (if any)

#### Test Mode vs Production

| Feature | Test Mode | Production Mode |
|---------|-----------|-----------------|
| Actual Delivery | ❌ No | ✅ Yes |
| Dashboard Logs | ✅ Yes | ✅ Yes |
| API Response | ✅ 200 OK | ✅ 200 OK |
| Domain Verification | ⚠️ Optional | ✅ Required |
| Rate Limits | ✅ Relaxed | ⚠️ Enforced |
| Cost | 💰 Free | 💰 Paid (per email) |

**Recommendation:** Use test mode during development and staging. Switch to production mode only after domain verification is complete.

### Production Checklist

Before going live, ensure:

- [ ] Domain `app.brolabentertainment.com` is verified in Resend
- [ ] DNS records are properly configured
- [ ] SPF and DKIM records are active
- [ ] Test emails are successfully delivered to Gmail, Outlook, Yahoo
- [ ] Emails are not landing in spam folders
- [ ] `RESEND_API_KEY` environment variable is set (production key)
- [ ] Email templates render correctly across email clients

## Monitoring & Troubleshooting

### Check Delivery Status

1. **Resend Dashboard Logs**
   - View all sent emails
   - Check delivery status (delivered, bounced, complained)
   - Review error messages

2. **Common Issues**

   | Issue | Cause | Solution |
   |-------|-------|----------|
   | Emails not sending | Domain not verified | Complete domain verification |
   | Emails in spam | Missing SPF/DKIM | Add all DNS records |
   | Bounced emails | Invalid recipient | Validate email addresses |
   | Rate limit errors | Too many emails | Implement rate limiting |

### Email Best Practices

- **From Address**: Use `noreply@app.brolabentertainment.com` or `hello@app.brolabentertainment.com`
- **Reply-To**: Set a monitored email for user replies
- **Subject Lines**: Clear, concise, avoid spam trigger words
- **Content**: Plain text + HTML versions for compatibility
- **Unsubscribe**: Include unsubscribe link (required for marketing emails)

## Environment Variables

```env
# Production
RESEND_API_KEY=re_live_...

# Development
RESEND_API_KEY=re_test_...
```

**Security:** Never commit API keys to version control. Use `.env.local` and add to `.gitignore`.

## Official Documentation

For detailed instructions and troubleshooting:

- **Domain Verification**: https://resend.com/docs/dashboard/domains/introduction
- **DNS Configuration**: https://resend.com/docs/dashboard/domains/dns-records
- **Email Best Practices**: https://resend.com/docs/send-with-nextjs
- **API Reference**: https://resend.com/docs/api-reference/emails/send-email

## Support

If you encounter issues:

1. Check [Resend Status Page](https://status.resend.com)
2. Review [Resend Documentation](https://resend.com/docs)
3. Contact Resend Support via dashboard
4. Check DNS propagation: https://dnschecker.org

---

**Last Updated:** February 2026  
**Requirement:** R-EMAIL-8 (Email Deliverability)
