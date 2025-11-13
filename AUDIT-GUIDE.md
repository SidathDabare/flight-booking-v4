# Code Audit Guide

This guide explains how to use the automated code audit tool to check if your codebase follows the rules defined in `.clauiderules`.

## Overview

The audit script analyzes your **client-facing code only** (excludes admin and agent components) and checks for:

- 🔒 **Security Issues**: Hardcoded secrets, missing validation, XSS vulnerabilities
- 🎨 **UI Consistency**: Design system compliance, color usage, spacing, shadows
- 📝 **TypeScript**: Type safety, proper interfaces, avoiding `any`
- ♿ **Accessibility**: ARIA labels, alt text, keyboard navigation
- ⚡ **Performance**: Image optimization, client/server components, bundle size
- 🎯 **Code Style**: Import order, naming conventions, best practices

## Running the Audit

### Quick Start

```bash
npm run audit
```

This will:
1. Scan all client-facing code
2. Generate issues report
3. Display summary in terminal
4. Save detailed reports to files

### What Gets Scanned

**Included Directories:**
- `app/(root)/` - Main application pages
- `components/ui/` - UI component library
- `components/custom ui/` - Custom components
- `components/client ui/` - Client-specific components
- `components/home/` - Homepage components
- `components/client-orders/` - Order components
- `components/messages/` - Messaging components
- `lib/` - Utility functions
- `hooks/` - Custom React hooks

**Excluded Directories:**
- `components/admin/` - Admin components (not checked)
- `components/agent/` - Agent components (not checked)
- `app/admin/` - Admin pages (not checked)
- `app/agent/` - Agent pages (not checked)
- `node_modules/` - Dependencies
- `.next/` - Build output

## Understanding the Results

### Severity Levels

#### 🔴 Critical
**Requires immediate attention!**
- Hardcoded secrets or API keys
- Security vulnerabilities
- Data exposure risks

**Example:**
```typescript
// ❌ CRITICAL - Hardcoded API key
const apiKey = "sk_live_123456789";

// ✅ CORRECT
const apiKey = process.env.STRIPE_SECRET_KEY;
```

#### 🟡 Warning
**Should be fixed soon**
- UI inconsistencies
- Missing dark mode support
- Type safety issues
- Accessibility problems

**Example:**
```typescript
// ❌ WARNING - Missing dark mode
<div className="bg-white text-gray-900">

// ✅ CORRECT
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

#### 🔵 Info
**Nice to have / optimization opportunities**
- Code style improvements
- Minor consistency issues
- Performance optimizations

**Example:**
```typescript
// 🔵 INFO - Could use standard component
<button className="px-4 py-2">Click</button>

// ✅ BETTER
<Button>Click</Button>
```

### Output Files

After running the audit, you'll get two files:

#### 1. `audit-report.json`
Machine-readable JSON format with all issues:
```json
{
  "timestamp": "2025-10-28T...",
  "filesScanned": 42,
  "issues": [...],
  "summary": {
    "critical": 0,
    "warnings": 12,
    "info": 24
  }
}
```

#### 2. `audit-report.md`
Human-readable Markdown report:
- Summary with counts
- Issues by category
- Detailed recommendations
- File locations and line numbers

## Common Issues & Fixes

### Security Issues

#### Issue: Hardcoded Secrets
```typescript
// ❌ BAD
const mongoUri = "mongodb://localhost:27017/mydb";

// ✅ GOOD
const mongoUri = process.env.MONGODB_URI;
```

#### Issue: Missing Input Validation
```typescript
// ❌ BAD
export async function POST(request: Request) {
  const body = await request.json();
  // Using body.email directly
}

// ✅ GOOD
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email } = result.data;
}
```

### UI Consistency Issues

#### Issue: Hardcoded Colors
```typescript
// ❌ BAD
<div className="bg-[#635bff] text-[#ffffff]">

// ✅ GOOD
<div className="bg-primary text-primary-foreground">
```

#### Issue: Custom Spacing
```typescript
// ❌ BAD
<div className="p-[23px] gap-[15px]">

// ✅ GOOD
<div className="p-lg gap-md">
```

#### Issue: Non-Standard Buttons
```typescript
// ❌ BAD
<button className="px-4 py-2 bg-blue-500 rounded">
  Click Me
</button>

// ✅ GOOD
import { Button } from "@/components/ui/button";

<Button variant="default">
  Click Me
</Button>
```

#### Issue: Missing Dark Mode
```typescript
// ❌ BAD
<Card className="bg-white border-gray-200">

// ✅ GOOD
<Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
```

### TypeScript Issues

#### Issue: Using `any` Type
```typescript
// ❌ BAD
function handleData(data: any) {
  return data.value;
}

// ✅ GOOD
interface DataType {
  value: string;
}

function handleData(data: DataType) {
  return data.value;
}
```

#### Issue: Missing Prop Types
```typescript
// ❌ BAD
const MyComponent = ({ title, onClick }) => {

// ✅ GOOD
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

const MyComponent = ({ title, onClick }: MyComponentProps) => {
```

### Accessibility Issues

#### Issue: Images Without Alt Text
```typescript
// ❌ BAD
<img src="/logo.png" />

// ✅ GOOD
<Image src="/logo.png" alt="Company Logo" width={200} height={50} />
```

#### Issue: Icon Buttons Without Labels
```typescript
// ❌ BAD
<button>
  <X />
</button>

// ✅ GOOD
<button aria-label="Close dialog">
  <X />
</button>
```

### Performance Issues

#### Issue: Using Regular img
```typescript
// ❌ BAD
<img src="/hero.jpg" />

// ✅ GOOD
import Image from "next/image";

<Image src="/hero.jpg" alt="Hero image" width={1200} height={600} />
```

#### Issue: Missing "use client"
```typescript
// ❌ BAD
import { useState } from "react";

const Component = () => {
  const [count, setCount] = useState(0);
  // ...
}

// ✅ GOOD
"use client";

import { useState } from "react";

const Component = () => {
  const [count, setCount] = useState(0);
  // ...
}
```

## Interpreting Categories

### Security
- Hardcoded secrets
- Missing validation
- XSS vulnerabilities
- Insecure error handling

### UI Consistency
- Color usage
- Spacing values
- Border radius
- Shadow usage
- Component usage

### TypeScript
- Type safety
- Avoiding `any`
- Proper interfaces
- Type annotations

### Accessibility
- ARIA labels
- Alt text
- Keyboard navigation
- Semantic HTML

### Performance
- Image optimization
- Client/server components
- Bundle size
- Code splitting

### Code Style
- Import order
- File organization
- Naming conventions
- Code formatting

## Best Practices

### Regular Audits
Run the audit:
- **Before commits**: Catch issues early
- **Before PRs**: Ensure quality
- **Weekly**: Maintain code health
- **After major changes**: Verify consistency

### Fixing Issues

1. **Start with Critical** - Fix security issues first
2. **Then Warnings** - Address UI and accessibility
3. **Finally Info** - Optimize and polish

### Integration with CI/CD

You can integrate the audit into your CI pipeline:

```yaml
# .github/workflows/audit.yml
name: Code Audit

on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run audit
      - name: Check for critical issues
        run: |
          CRITICAL=$(jq '.summary.critical' audit-report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "Critical issues found!"
            exit 1
          fi
```

## Customizing the Audit

You can modify `scripts/audit-codebase.ts` to:
- Add custom checks
- Adjust severity levels
- Include/exclude directories
- Change reporting format

## Getting Help

If you encounter issues:

1. Check the detailed report in `audit-report.md`
2. Review `.clauiderules` for expected patterns
3. Look at existing code that passes the checks
4. Consult the recommendations in the report

## Example Workflow

```bash
# 1. Run the audit
npm run audit

# 2. Review the summary in terminal
# Look for critical issues first

# 3. Open detailed report
code audit-report.md

# 4. Fix critical issues immediately
# Update the files mentioned

# 5. Re-run audit to verify fixes
npm run audit

# 6. Fix warnings
# Work through the warning list

# 7. Address info items
# Optimize and polish

# 8. Final audit check
npm run audit

# 9. Should see minimal or no issues
# Ready to commit!
```

## Automation Tips

### VS Code Task

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Audit Codebase",
      "type": "npm",
      "script": "audit",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run audit

# Fail if critical issues found
CRITICAL=$(node -p "require('./audit-report.json').summary.critical")
if [ "$CRITICAL" -gt 0 ]; then
  echo "❌ Critical issues found! Fix before committing."
  exit 1
fi
```

## Summary

The audit tool helps maintain:
- ✅ Consistent UI across the application
- ✅ Secure code without vulnerabilities
- ✅ Type-safe TypeScript
- ✅ Accessible interfaces
- ✅ Optimized performance
- ✅ Clean code following best practices

Run it regularly to keep your codebase healthy and production-ready!
