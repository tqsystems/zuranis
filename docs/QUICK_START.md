# ZURANIS Quick Start Guide

## 🚀 Get Up and Running in 10 Minutes

Your complete data integration is **already built**! Follow these steps to go live.

---

## ✅ Prerequisites Checklist

- [x] Next.js 14 app running
- [x] GitHub OAuth configured
- [x] Supabase project created
- [ ] Database migration run
- [ ] Webhook secret configured
- [ ] GitHub webhook set up
- [ ] GitHub Actions workflow created

---

## Step 1: Run Database Migration (2 minutes)

### Option A: Using Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
6. Paste into the editor
7. Click **Run**
8. Verify: You should see a success message

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Verify Migration

Run this query in SQL Editor:

```sql
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

You should see: `users`, `repositories`, `releases`, `risk_items`, `webhook_logs`

---

## Step 2: Configure Environment Variables (1 minute)

Add to your `.env.local`:

```bash
# Generate a secure webhook secret
GITHUB_WEBHOOK_SECRET=$(openssl rand -base64 32)
```

Or manually:

```bash
# Run this command to generate a secret
openssl rand -base64 32

# Then add to .env.local
GITHUB_WEBHOOK_SECRET=your-generated-secret-here
```

### Verify All Environment Variables

Your `.env.local` should have:

```bash
✅ NEXTAUTH_URL=http://localhost:3000
✅ NEXTAUTH_SECRET=...
✅ GITHUB_CLIENT_ID=...
✅ GITHUB_CLIENT_SECRET=...
✅ NEXT_PUBLIC_SUPABASE_URL=...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=...
✅ SUPABASE_SERVICE_ROLE_KEY=...
✅ GITHUB_WEBHOOK_SECRET=...  ← NEW!
```

---

## Step 3: Test Webhook Endpoint Locally (2 minutes)

### Start Development Server

```bash
npm run dev
```

### Test the Webhook

```bash
# Set your webhook secret
export WEBHOOK_SECRET="your-secret-from-env-local"

# Create test payload
cat > test-payload.json << 'EOF'
{
  "repository": {
    "id": 123456,
    "name": "test-repo",
    "owner": "testuser",
    "full_name": "testuser/test-repo"
  },
  "release": {
    "number": "v1.0.0",
    "commit_sha": "abc123",
    "branch": "main",
    "workflow_run_id": "12345"
  },
  "coverage": {
    "total": 87.5,
    "lines": {"total": 1000, "covered": 875, "pct": 87.5},
    "statements": {"total": 1000, "covered": 875, "pct": 87.5},
    "functions": {"total": 100, "covered": 88, "pct": 88.0},
    "branches": {"total": 200, "covered": 170, "pct": 85.0}
  },
  "tests": {
    "total": 253,
    "passed": 245,
    "failed": 8,
    "skipped": 0
  },
  "timestamp": "2024-01-30T10:00:00Z"
}
EOF

# Calculate signature
PAYLOAD=$(cat test-payload.json)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

# Send webhook
curl -X POST http://localhost:3000/api/github/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -H "X-GitHub-Event: coverage" \
  -H "X-GitHub-Delivery: test-123" \
  -d @test-payload.json

# Expected response:
# {
#   "success": true,
#   "release_id": "some-uuid",
#   "metrics": {
#     "releaseConfidence": 87.04,
#     "testCoverage": 87.5,
#     "riskLevel": "Medium",
#     "timeToShip": "1h 30m",
#     "passRate": 96.84
#   },
#   "risks": 2,
#   "processing_time": 245
# }
```

### Verify in Supabase

Check that data was created:

```sql
-- Check releases
SELECT * FROM releases ORDER BY created_at DESC LIMIT 1;

-- Check risk items
SELECT * FROM risk_items ORDER BY created_at DESC LIMIT 5;

-- Check webhook logs
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 1;
```

---

## Step 4: Test Dashboard (1 minute)

1. Open browser: http://localhost:3000
2. Sign in with GitHub
3. Navigate to `/dashboard`
4. You should see:
   - ✅ Release overview with v1.0.0
   - ✅ Metrics cards showing 87.04 confidence
   - ✅ Risk level: Medium
   - ✅ Risk items listed

If you see this, **everything is working!** 🎉

---

## Step 5: Set Up GitHub Webhook (2 minutes)

### For Production (Required)

1. Go to your GitHub repository
2. Click **Settings** > **Webhooks** > **Add webhook**
3. Configure:
   - **Payload URL**: `https://your-domain.com/api/github/webhook`
   - **Content type**: `application/json`
   - **Secret**: Your `GITHUB_WEBHOOK_SECRET` (copy from `.env.local`)
   - **Which events**: 
     - Option 1: Select "Send me everything"
     - Option 2: Select "Let me select" → Choose `workflow_run`
   - **Active**: ✅ Checked
4. Click **Add webhook**
5. GitHub will send a ping event
6. Check **Recent Deliveries** tab - should show ✅ green checkmark

### For Local Development (Optional)

Use **ngrok** to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the HTTPS URL in GitHub webhook settings
# Example: https://abc123.ngrok.io/api/github/webhook
```

---

## Step 6: Configure GitHub Actions (2 minutes)

Create `.github/workflows/releason.yml` in your repository:

```yaml
name: Releason Coverage Report

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test-and-coverage:
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
        run: npm test -- --coverage --coverageReporters=json
      
      - name: Send coverage to Releason
        if: always()
        run: |
          # Get coverage data
          COVERAGE=$(cat coverage/coverage-summary.json)
          TOTAL_COV=$(echo $COVERAGE | jq -r '.total.lines.pct')
          
          # Get test results (assumes Jest)
          TESTS_TOTAL=$(cat coverage/coverage-summary.json | jq '.total.lines.total')
          TESTS_PASSED=$(cat coverage/coverage-summary.json | jq '.total.lines.covered')
          TESTS_FAILED=$(($TESTS_TOTAL - $TESTS_PASSED))
          
          # Create payload
          PAYLOAD=$(cat <<EOF
          {
            "repository": {
              "id": ${{ github.repository_id }},
              "name": "${{ github.event.repository.name }}",
              "owner": "${{ github.repository_owner }}",
              "full_name": "${{ github.repository }}"
            },
            "release": {
              "number": "${{ github.sha }}",
              "commit_sha": "${{ github.sha }}",
              "branch": "${{ github.ref_name }}",
              "workflow_run_id": "${{ github.run_id }}"
            },
            "coverage": $COVERAGE,
            "tests": {
              "total": $TESTS_TOTAL,
              "passed": $TESTS_PASSED,
              "failed": $TESTS_FAILED,
              "skipped": 0
            },
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
          }
          EOF
          )
          
          # Calculate signature
          SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "${{ secrets.ZURANIS_WEBHOOK_SECRET }}" | awk '{print $2}')
          
          # Send to Releason
          curl -X POST ${{ secrets.ZURANIS_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
            -H "X-GitHub-Event: coverage" \
            -H "X-GitHub-Delivery: ${{ github.run_id }}" \
            -d "$PAYLOAD"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Add GitHub Secrets

1. Go to repository **Settings** > **Secrets and variables** > **Actions**
2. Add secrets:
   - `ZURANIS_WEBHOOK_URL`: `https://your-domain.com/api/github/webhook`
   - `ZURANIS_WEBHOOK_SECRET`: Your `GITHUB_WEBHOOK_SECRET`

### Commit and Push

```bash
git add .github/workflows/releason.yml
git commit -m "Add Releason coverage reporting"
git push
```

Watch the workflow run in the **Actions** tab!

---

## Verification Checklist

After completing all steps, verify:

### Database
- [ ] All 5 tables exist in Supabase
- [ ] Sample release record created (from test)
- [ ] Risk items generated
- [ ] Webhook log recorded

### Webhook
- [ ] Webhook endpoint responds to POST
- [ ] Signature validation works
- [ ] Data stored in Supabase
- [ ] GitHub webhook shows green checkmark

### Dashboard
- [ ] Can sign in with GitHub
- [ ] Dashboard loads without errors
- [ ] Shows real release data
- [ ] Metrics display correctly
- [ ] Risk items shown
- [ ] Feature breakdown shown
- [ ] Auto-refresh works (wait 30 sec)
- [ ] Manual refresh button works

### GitHub Actions
- [ ] Workflow file committed
- [ ] Secrets configured
- [ ] Workflow runs on push
- [ ] Tests execute
- [ ] Coverage generated
- [ ] Webhook called
- [ ] New release appears in dashboard

---

## Troubleshooting

### Problem: Webhook returns 401 Unauthorized

**Solution**: 
- Verify `GITHUB_WEBHOOK_SECRET` matches in:
  - `.env.local` file
  - GitHub webhook settings
  - GitHub Actions secrets
- Regenerate signature using correct secret

### Problem: Dashboard shows "No releases yet"

**Solutions**:
1. Check webhook was triggered:
   ```sql
   SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 5;
   ```
2. Check release was created:
   ```sql
   SELECT * FROM releases ORDER BY created_at DESC LIMIT 5;
   ```
3. Check user ID matches:
   ```sql
   SELECT u.*, r.* 
   FROM users u
   LEFT JOIN repositories repo ON repo.user_id = u.id
   LEFT JOIN releases r ON r.repo_id = repo.id
   ORDER BY r.created_at DESC;
   ```

### Problem: GitHub Actions workflow fails

**Solutions**:
- Check test command is correct: `npm test`
- Verify coverage is generated: `--coverage` flag
- Check secrets are set in GitHub
- Review workflow logs in Actions tab

### Problem: Database permission denied

**Solution**:
- Verify RLS policies are set correctly
- Check `SUPABASE_SERVICE_ROLE_KEY` is set (for webhooks)
- Ensure user is authenticated (for dashboard)

---

## Next Steps

### Immediate
1. ✅ Deploy to production (Vercel, Railway, etc.)
2. ✅ Update webhook URL to production domain
3. ✅ Test with real repository

### Short-term
- [ ] Add more repositories
- [ ] Monitor webhook delivery rate
- [ ] Set up alerts for high-risk releases
- [ ] Customize risk thresholds

### Long-term
- [ ] Historical trend analysis
- [ ] Team collaboration features
- [ ] Custom dashboards
- [ ] Integration with Slack/Discord

---

## Useful Commands

### Development
```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run tests
npm test -- --coverage  # Run tests with coverage
```

### Database
```bash
supabase db reset       # Reset database (careful!)
supabase db push        # Push migrations
supabase db pull        # Pull schema
```

### Testing
```bash
# Test webhook locally
./scripts/test-webhook.sh

# Check logs
tail -f .next/trace

# Monitor Supabase
# Go to Dashboard > Logs > API
```

---

## Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
vercel env add GITHUB_WEBHOOK_SECRET production
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variables
railway variables set GITHUB_WEBHOOK_SECRET=your-secret
```

---

## Success! 🎉

If you've completed all steps, you now have:

✅ Database with proper schema  
✅ Webhook endpoint receiving data  
✅ Dashboard displaying real metrics  
✅ GitHub Actions sending coverage  
✅ Automatic risk assessment  
✅ Historical data tracking  

**Your Release Confidence Intelligence Platform is live!** 🚀

---

## Support

Need help? Check these resources:

1. **Documentation**:
   - `docs/INTEGRATION_COMPLETE.md` - Full integration guide
   - `docs/DATA_FLOW.md` - Architecture diagram
   - `docs/GITHUB_ACTIONS_SETUP.md` - Workflow examples

2. **Database**:
   - Query `webhook_logs` table for delivery status
   - Check console logs in terminal
   - Review Supabase logs in dashboard

3. **Testing**:
   - Use curl commands to test webhook
   - Check GitHub webhook delivery logs
   - Test with sample payloads

---

**Happy shipping with confidence!** 🚢✨
