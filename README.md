# n8n-nodes-persona

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **Persona** identity verification platform, providing 22 resources and 200+ operations for KYC/AML verification, document verification, biometric checks, watchlist screening, and compliance automation.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## Features

- **Identity Verification**: Complete inquiry lifecycle management including creation, approval, decline, and redaction
- **Document Verification**: Process government IDs, passports, driver's licenses, and supporting documents
- **Biometric Verification**: Selfie verification with liveness detection and face matching
- **Database Verification**: Real-time identity data verification against authoritative sources
- **Watchlist Screening**: PEP, sanctions, and adverse media screening with ongoing monitoring
- **Transaction Monitoring**: Risk-based transaction analysis and fraud prevention
- **Case Management**: Manual review workflows with assignment, comments, and history
- **Compliance Reporting**: AML checks, KYC status, risk scores, and audit trails
- **Analytics**: Verification stats, conversion funnels, and performance metrics
- **Real-time Webhooks**: 50+ event types for inquiry, verification, account, and more

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install**
3. Enter `n8n-nodes-persona`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-persona
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-persona.git
cd n8n-nodes-persona

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
npm link
cd ~/.n8n
npm link n8n-nodes-persona
```

## Credentials Setup

### Persona API Credentials

| Field | Description |
|-------|-------------|
| Environment | Production, Sandbox, or Custom |
| API Key | Your Persona API key from Dashboard → Settings → API Keys |
| API Key Secret | (Optional) For webhook signature verification |
| API Version | Default: 2023-01-05 |
| Default Template ID | (Optional) Default inquiry template |
| Webhook Secret | (Optional) For verifying incoming webhooks |

### Persona Embedded Credentials

| Field | Description |
|-------|-------------|
| Environment | Production or Sandbox |
| Client ID | From Dashboard → Settings → Embedded |
| Theme ID | (Optional) Custom branding theme |
| API Key | Your Persona API key |

## Resources & Operations

### Inquiry (21 Operations)
Create, get, list, approve, decline, expire, redact, resume, update, generate one-time links, manage tags, get fields/documents/selfies/verifications/sessions/reports, transition state

### Verification (12 Operations)
Get verification details by type (government ID, selfie, database, phone, email, document), list verifications, get checks, retry failed verifications

### Account (14 Operations)
Create, get, list, update, redact accounts, manage tags, merge accounts, get inquiries/transactions/lists, consolidate, view history

### Document (9 Operations)
Get documents, download images (front/back), extract data, view checks, submit for verification

### Selfie (8 Operations)
Get selfies, download poses (center/left/right), get liveness checks, face match scores, compare selfies

### Government ID (10 Operations)
Get IDs, download images, extract data (barcode/MRZ/NFC), view checks, verify

### Database Verification (11 Operations)
Get verification details, matched records, data sources, verification score, input/output data, discrepancies

### Report (13 Operations)
Get/create reports, download PDFs, view checks/summaries, specific report types (adverse media, watchlist, PEP, social media, background check)

### Watchlist (12 Operations)
Screen against watchlists, manage hits, mark true match/false positive, get sources, ongoing monitoring

### Transaction (13 Operations)
Create, get, list, update, approve/decline transactions, view risk signals, labels, related transactions

### Case (16 Operations)
Create, get, list, update, assign, close/reopen cases, manage comments, add/remove inquiries

### Template (12 Operations)
Get, list, update, clone, archive/restore templates, view versions/steps/fields/stats

### Workflow (9 Operations)
Get workflows, runs, steps, actions, decision points, stats, trigger workflows

### Event (8 Operations)
Get events by ID/inquiry/account, search, list, get event types

### Webhook (12 Operations)
Create, get, list, update, delete, test webhooks, manage deliveries, enable/disable

### List (11 Operations)
Create/manage lists, add/remove items, search, get matches, import/export

### API Log (7 Operations)
View API logs, filter by date/endpoint/status, search

### Session (10 Operations)
Get session details, events, duration, device info, location, browser, drop-off analysis

### Embedded Flow (10 Operations)
Generate inquiry/resume URLs, get client tokens, manage themes, localization

### Analytics (12 Operations)
Verification stats, approval/decline rates, completion rates, conversion funnels, daily/monthly stats

### Compliance (11 Operations)
Compliance status, AML checks, KYC status, risk scores, audit trails, GDPR/CCPA status, data export/deletion

### Utility (10 Operations)
Test connection, validate API key, check service status, get supported countries/documents

## Trigger Node

The **Persona Trigger** node listens for real-time webhook events:

### Inquiry Events
- inquiry.created, started, completed, approved, declined, expired, failed, pending, needs-review, transitioned

### Verification Events
- verification.passed, failed, requires-review
- Document, selfie, database, phone, email verification events

### Account Events
- account.created, updated, redacted, merged, tag.added

### Watchlist Events
- hit.detected, hit.cleared, hit.confirmed, hit.false-positive, ongoing-monitoring.alert

### Transaction Events
- transaction.created, approved, declined, flagged, high-risk

### Case Events
- case.created, assigned, updated, closed, comment.added

### Document & Session Events
- Document submitted, processed, rejected, expired
- Session started, completed, abandoned, timeout

### Report Events
- report.generated, updated, adverse-media.found, pep.match

## Usage Examples

### Create and Verify an Identity

```javascript
// 1. Create an inquiry
const inquiry = await personaNode.execute({
  resource: 'inquiry',
  operation: 'create',
  templateId: 'itmpl_ABC123',
  additionalFields: {
    referenceId: 'user_12345',
    redirectUri: 'https://yourapp.com/verify/complete'
  }
});

// 2. Generate a one-time link for the user
const link = await personaNode.execute({
  resource: 'inquiry',
  operation: 'generateOneTimeLink',
  inquiryId: inquiry.data.id
});

// 3. Send link to user and wait for completion via webhook
```

### Screen Against Watchlists

```javascript
const screening = await personaNode.execute({
  resource: 'watchlist',
  operation: 'screen',
  nameFirst: 'John',
  nameLast: 'Doe',
  additionalFields: {
    birthdate: '1980-01-15',
    countryCode: 'US'
  }
});
```

### Process Inquiry Webhook

```javascript
// PersonaTrigger node configuration
{
  events: ['inquiry.completed', 'inquiry.approved', 'inquiry.declined'],
  verifySignature: true
}

// Webhook payload received:
{
  eventType: 'inquiry.completed',
  resourceId: 'inq_ABC123',
  attributes: {
    status: 'completed',
    'created-at': '2024-01-15T10:00:00Z'
  }
}
```

## Persona Concepts

| Concept | Description |
|---------|-------------|
| **Inquiry** | A verification session capturing user identity information |
| **Verification** | A specific identity check (government ID, selfie, database, etc.) |
| **Account** | A user identity record that persists across inquiries |
| **Template** | Configuration defining the verification flow and requirements |
| **Session** | A user's interaction with the verification flow |
| **Selfie** | Biometric verification using facial recognition |
| **Liveness** | Anti-spoofing check to ensure a real person is present |
| **Government ID** | Official document verification (passport, driver's license, etc.) |
| **Database Verification** | Identity data matching against authoritative sources |
| **Watchlist** | Sanctions, PEP, and adverse media screening |
| **Case** | Manual review workflow for flagged verifications |
| **Report** | Background check results (criminal, credit, employment, etc.) |

## Error Handling

The node provides detailed error messages for common issues:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API Key | Incorrect or expired API key | Verify credentials in Persona dashboard |
| Template Not Found | Invalid template ID | Check template exists and is active |
| Inquiry Not Found | Invalid inquiry ID | Verify inquiry ID format (inq_...) |
| Rate Limited | Too many API requests | Implement request throttling |
| Signature Mismatch | Invalid webhook signature | Verify webhook secret configuration |

## Security Best Practices

1. **Never log API keys or secrets** - Use environment variables for credentials
2. **Verify webhook signatures** - Always enable signature verification in production
3. **Handle PII securely** - Persona handles sensitive data; follow your data protection policies
4. **Use HTTPS only** - All Persona API communication uses TLS encryption
5. **Implement proper redaction** - Use redact operations when data is no longer needed
6. **Follow data retention policies** - Configure appropriate data retention in Persona dashboard

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Persona API Docs](https://docs.withpersona.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-persona/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

## Acknowledgments

- [Persona](https://withpersona.com) for their comprehensive identity verification platform
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for their support and feedback
