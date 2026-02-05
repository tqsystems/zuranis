# GitHub Actions Setup Guide

## Overview

This guide explains how to configure your GitHub Actions workflow to send coverage data to Releason.

## Required Workflow Output

Your GitHub Actions workflow must send a POST request to the Releason webhook endpoint with the following JSON payload structure:

### Webhook Endpoint

```
POST https://your-domain.com/api/github/webhook
```

### Headers

```
Content-Type: application/json
X-Hub-Signature-256: sha256=<hmac-signature>
X-GitHub-Event: coverage
X-GitHub-Delivery: <unique-delivery-id>
```

### Payload Structure

```typescript
{
  "repository": {
    "id": 123456789,
    "name": "my-repo",
    "owner": "myusername",
    "full_name": "myusername/my-repo"
  },
  "release": {
    "number": "v1.2.3",
    "commit_sha": "abc123def456",
    "branch": "main",
    "workflow_run_id": "1234567890"
  },
  "coverage": {
    "total": 87.5,
    "lines": {
      "total": 1000,
      "covered": 875,
      "skipped": 0,
      "pct": 87.5
    },
    "statements": {
      "total": 1200,
      "covered": 1050,
      "skipped": 0,
      "pct": 87.5
    },
    "functions": {
      "total": 200,
      "covered": 175,
      "skipped": 0,
      "pct": 87.5
    },
    "branches": {
      "total": 400,
      "covered": 350,
      "skipped": 0,
      "pct": 87.5
    }
  },
  "tests": {
    "total": 253,
    "passed": 245,
    "failed": 8,
    "skipped": 0,
    "duration": 45000
  },
  "features": [
    {
      "name": "Authentication",
      "coverage": 98.5,
      "status": "excellent",
      "testCount": 45,
      "linesCovered": 890,
      "totalLines": 903
    },
    {
      "name": "API Routes",
      "coverage": 92.0,
      "status": "good",
      "testCount": 67,
      "linesCovered": 1150,
      "totalLines": 1250
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Example GitHub Actions Workflow

Here's a complete example workflow that runs tests, generates coverage, and sends data to Releason:

```yaml
name: Test and Coverage

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Generate coverage JSON
        run: |
          # This assumes you're using Jest with coverage
          # Adjust based on your test framework
          npm run test:coverage -- --json --outputFile=coverage/coverage-summary.json
      
      - name: Send coverage to Releason
        if: github.ref == 'refs/heads/main'
        env:
          ZURANIS_WEBHOOK_URL: ${{ secrets.ZURANIS_WEBHOOK_URL }}
          ZURANIS_WEBHOOK_SECRET: ${{ secrets.ZURANIS_WEBHOOK_SECRET }}
        run: |
          node .github/scripts/send-coverage.js

```

## Send Coverage Script

Create `.github/scripts/send-coverage.js`:

```javascript
const fs = require('fs');
const crypto = require('crypto');

// Read coverage data
const coverage = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));

// Prepare payload
const payload = {
  repository: {
    id: parseInt(process.env.GITHUB_REPOSITORY_ID || '0'),
    name: process.env.GITHUB_REPOSITORY.split('/')[1],
    owner: process.env.GITHUB_REPOSITORY.split('/')[0],
    full_name: process.env.GITHUB_REPOSITORY
  },
  release: {
    number: process.env.GITHUB_REF_NAME || 'unknown',
    commit_sha: process.env.GITHUB_SHA,
    branch: process.env.GITHUB_REF_NAME,
    workflow_run_id: process.env.GITHUB_RUN_ID
  },
  coverage: {
    total: coverage.total.lines.pct,
    lines: coverage.total.lines,
    statements: coverage.total.statements,
    functions: coverage.total.functions,
    branches: coverage.total.branches
  },
  tests: {
    total: coverage.numTotalTests || 0,
    passed: coverage.numPassedTests || 0,
    failed: coverage.numFailedTests || 0,
    skipped: coverage.numPendingTests || 0,
    duration: coverage.testRunTime || 0
  },
  features: extractFeatures(coverage),
  timestamp: new Date().toISOString()
};

// Create signature
const secret = process.env.ZURANIS_WEBHOOK_SECRET;
const payloadString = JSON.stringify(payload);
const signature = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(payloadString)
  .digest('hex');

// Send to Releason
fetch(process.env.ZURANIS_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hub-Signature-256': signature,
    'X-GitHub-Event': 'coverage',
    'X-GitHub-Delivery': crypto.randomUUID()
  },
  body: payloadString
})
.then(response => response.json())
.then(data => {
  console.log('✅ Coverage sent to Releason successfully!');
  console.log('Release ID:', data.release_id);
  console.log('Metrics:', data.metrics);
})
.catch(error => {
  console.error('❌ Failed to send coverage:', error);
  process.exit(1);
});

function extractFeatures(coverage) {
  // Group files by feature/directory
  const features = {};
  
  for (const [filePath, data] of Object.entries(coverage)) {
    if (filePath === 'total') continue;
    
    // Extract feature from path (e.g., src/auth/login.ts -> auth)
    const parts = filePath.split('/');
    const featureName = parts[1] || 'core';
    
    if (!features[featureName]) {
      features[featureName] = {
        name: featureName,
        totalLines: 0,
        coveredLines: 0,
        testCount: 0
      };
    }
    
    features[featureName].totalLines += data.lines.total;
    features[featureName].coveredLines += data.lines.covered;
  }
  
  // Calculate percentages and format
  return Object.values(features).map(f => ({
    name: formatFeatureName(f.name),
    coverage: (f.coveredLines / f.totalLines) * 100,
    status: getCoverageStatus((f.coveredLines / f.totalLines) * 100),
    linesCovered: f.coveredLines,
    totalLines: f.totalLines
  }));
}

function formatFeatureName(name) {
  const names = {
    'auth': 'Authentication',
    'api': 'API Routes',
    'db': 'Database',
    'ui': 'User Interface'
  };
  return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

function getCoverageStatus(pct) {
  if (pct >= 95) return 'excellent';
  if (pct >= 80) return 'good';
  if (pct >= 60) return 'warning';
  return 'danger';
}
```

## GitHub Repository Secrets

Add these secrets to your GitHub repository:

1. Go to: Repository > Settings > Secrets and variables > Actions
2. Add these secrets:

```
ZURANIS_WEBHOOK_URL=https://your-domain.com/api/github/webhook
ZURANIS_WEBHOOK_SECRET=<your-webhook-secret>
```

## Testing the Webhook

### 1. Test Locally

```bash
# Generate a test signature
PAYLOAD='{"test":true}'
SECRET="your-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send test request
curl -X POST http://localhost:3000/api/github/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -H "X-GitHub-Event: coverage" \
  -d "$PAYLOAD"
```

### 2. Verify in Supabase

Check the `webhook_logs` table in Supabase to see if the webhook was received and processed.

## Troubleshooting

### Webhook Signature Validation Failed

- Verify `GITHUB_WEBHOOK_SECRET` matches between GitHub Actions and Releason
- Ensure the secret is the same in both places (no extra spaces)
- Check that the signature is being generated correctly

### No Data Appearing in Dashboard

- Check webhook logs in Supabase `webhook_logs` table
- Verify user exists and repository is linked
- Check server logs for errors

### Coverage Not Calculated Correctly

- Verify coverage JSON format matches expected structure
- Check that `total` field is present in coverage data
- Ensure test results include `passed` and `failed` counts

## Support

For issues or questions, see:
- [Dashboard Documentation](./DASHBOARD.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Authentication Guide](./AUTHENTICATION.md)
