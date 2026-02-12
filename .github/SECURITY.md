# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in BroLab Fanbase, please report it by emailing security@brolabentertainment.com. Please do not create a public GitHub issue.

We will respond to your report within 48 hours and work with you to understand and resolve the issue.

## Security Measures

### Dependency Management

We use the following tools and practices to ensure our dependencies are secure:

1. **Automated Audits**: Weekly automated security audits via GitHub Actions
2. **Dependabot**: Automated dependency updates for security patches
3. **NPM Audit**: Regular manual audits before releases
4. **Lock Files**: Committed `package-lock.json` for reproducible builds

### Running Security Checks

```bash
# Check for vulnerabilities
npm run security:audit

# Check for outdated packages and vulnerabilities
npm run security:check

# Attempt to fix vulnerabilities automatically
npm run security:fix
```

### Critical Dependencies

The following dependencies are critical to our security posture:

- `@clerk/nextjs` - Authentication
- `stripe` - Payment processing
- `convex` - Backend/Database
- `next` - Framework

These are monitored closely and updated promptly when security patches are released.

## Security Best Practices

### For Contributors

1. Never commit secrets or API keys
2. Run `npm audit` before submitting PRs
3. Keep dependencies up to date
4. Follow secure coding practices
5. Use environment variables for sensitive data

### For Maintainers

1. Review Dependabot PRs promptly
2. Monitor security advisories
3. Perform security audits before releases
4. Keep production dependencies minimal
5. Regularly review and update this policy

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Initial response and triage
3. **Day 3-7**: Investigation and patch development
4. **Day 7-14**: Testing and validation
5. **Day 14**: Public disclosure and patch release

## Contact

For security concerns, contact: security@brolab.dev
