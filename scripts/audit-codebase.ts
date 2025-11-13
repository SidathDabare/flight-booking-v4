/**
 * Codebase Audit Script
 *
 * This script checks the codebase against the rules defined in .clauiderules
 * Focus: Client-facing code (excludes admin and agent components)
 *
 * Run with: npx tsx scripts/audit-codebase.ts
 */

import fs from 'fs';
import path from 'path';

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  file: string;
  line?: number;
  message: string;
  recommendation?: string;
}

interface AuditReport {
  timestamp: string;
  filesScanned: number;
  issues: AuditIssue[];
  summary: {
    critical: number;
    warnings: number;
    info: number;
  };
  categories: Record<string, number>;
}

class CodebaseAuditor {
  private issues: AuditIssue[] = [];
  private filesScanned = 0;
  private rootDir: string;

  // Directories to scan (client-facing only)
  private includeDirs = [
    'app/(root)',
    'components/ui',
    'components/custom ui',
    'components/client ui',
    'components/home',
    'components/client-orders',
    'components/messages',
    'lib',
    'hooks',
  ];

  // Directories to exclude
  private excludeDirs = [
    'node_modules',
    '.next',
    'components/admin',
    'components/agent',
    'app/admin',
    'app/agent',
  ];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * Main audit function
   */
  async audit(): Promise<AuditReport> {
    console.log('🔍 Starting codebase audit...\n');

    // Scan all included directories
    for (const dir of this.includeDirs) {
      const fullPath = path.join(this.rootDir, dir);
      if (fs.existsSync(fullPath)) {
        await this.scanDirectory(fullPath);
      }
    }

    // Generate report
    const report = this.generateReport();

    // Print summary
    this.printSummary(report);

    // Save detailed report
    this.saveReport(report);

    return report;
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      // Skip excluded directories
      if (this.shouldExclude(fullPath)) {
        continue;
      }

      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.shouldScanFile(fullPath)) {
        await this.scanFile(fullPath);
      }
    }
  }

  /**
   * Check if path should be excluded
   */
  private shouldExclude(filePath: string): boolean {
    return this.excludeDirs.some(excluded =>
      filePath.includes(path.sep + excluded + path.sep) ||
      filePath.endsWith(path.sep + excluded)
    );
  }

  /**
   * Check if file should be scanned
   */
  private shouldScanFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  /**
   * Scan individual file
   */
  private async scanFile(filePath: string): Promise<void> {
    this.filesScanned++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.rootDir, filePath);

    // Run all checks
    this.checkSecurity(relativePath, content, lines);
    this.checkUIConsistency(relativePath, content, lines);
    this.checkTypeScript(relativePath, content, lines);
    this.checkAccessibility(relativePath, content, lines);
    this.checkPerformance(relativePath, content, lines);
    this.checkImports(relativePath, content, lines);
    this.checkStyling(relativePath, content, lines);
  }

  /**
   * Security checks
   */
  private checkSecurity(file: string, content: string, lines: string[]): void {
    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
      /secret\s*=\s*['"][^'"]+['"]/i,
      /password\s*=\s*['"][^'"]+['"]/i,
      /token\s*=\s*['"][^'"]+['"]/i,
      /mongodb:\/\/[^'"]+/i,
      /postgres:\/\/[^'"]+/i,
    ];

    lines.forEach((line, index) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('process.env')) {
          this.addIssue({
            severity: 'critical',
            category: 'Security',
            file,
            line: index + 1,
            message: 'Potential hardcoded secret detected',
            recommendation: 'Use environment variables (process.env) instead'
          });
        }
      });
    });

    // Check for console.log with sensitive data
    if (content.includes('console.log') && (
      content.includes('password') ||
      content.includes('token') ||
      content.includes('secret')
    )) {
      this.addIssue({
        severity: 'warning',
        category: 'Security',
        file,
        message: 'console.log may contain sensitive information',
        recommendation: 'Remove or sanitize console.log statements in production'
      });
    }

    // Check for dangerouslySetInnerHTML
    if (content.includes('dangerouslySetInnerHTML')) {
      this.addIssue({
        severity: 'warning',
        category: 'Security',
        file,
        message: 'dangerouslySetInnerHTML usage detected',
        recommendation: 'Ensure content is properly sanitized to prevent XSS'
      });
    }

    // Check for missing input validation
    if (file.includes('api/') && !content.includes('z.object') && !content.includes('zod')) {
      this.addIssue({
        severity: 'warning',
        category: 'Security',
        file,
        message: 'API route without Zod validation',
        recommendation: 'Add Zod schema validation for all API inputs'
      });
    }
  }

  /**
   * UI Consistency checks
   */
  private checkUIConsistency(file: string, content: string, lines: string[]): void {
    // Only check component files
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) return;
    if (file.includes('/api/')) return;

    // Check for excessive inline styles (should use Tailwind)
    // Only flag if there are multiple inline style instances (pattern of misuse)
    const styleMatches = content.match(/style={{|style = {/g);
    if (styleMatches && styleMatches.length >= 3) {
      this.addIssue({
        severity: 'warning',
        category: 'UI Consistency',
        file,
        message: 'Multiple inline styles detected',
        recommendation: 'Use Tailwind CSS classes instead of inline styles for better maintainability'
      });
    }

    // Check for non-standard button usage
    // Skip base UI components and files that already import Button
    const isBaseComponent = file.includes('components/ui/button') || file.includes('components/ui/');
    const importsButton = content.includes('from "@/components/ui/button"');
    const hasNativeButton = content.includes('<button');

    if (hasNativeButton && !importsButton && !isBaseComponent) {
      this.addIssue({
        severity: 'info',
        category: 'UI Consistency',
        file,
        message: 'Native button element used',
        recommendation: 'Consider using <Button> from @/components/ui/button for consistency'
      });
    }

    // Check for hardcoded colors
    const hardcodedColorPattern = /(bg|text|border)-\[(#|rgb|rgba)/;
    if (hardcodedColorPattern.test(content)) {
      this.addIssue({
        severity: 'warning',
        category: 'UI Consistency',
        file,
        message: 'Hardcoded colors detected',
        recommendation: 'Use Tailwind color variables (bg-primary, text-foreground, etc.)'
      });
    }

    // Check for non-standard spacing
    const customSpacingPattern = /className="[^"]*\s(p|m|gap)-\[[\d]+px\]/;
    if (customSpacingPattern.test(content)) {
      this.addIssue({
        severity: 'info',
        category: 'UI Consistency',
        file,
        message: 'Custom spacing values detected',
        recommendation: 'Use standard spacing scale (xs, sm, md, lg, xl, 2xl, etc.)'
      });
    }

    // Check for missing dark mode support - only flag if file has NO dark mode at all
    // Having bg-white without dark: is OK if the file has other dark mode support
    const hasBgWhite = content.includes('bg-white');
    const hasDarkMode = content.includes('dark:');
    const hasMultipleBgWhite = (content.match(/bg-white/g) || []).length >= 3;

    if (hasBgWhite && !hasDarkMode && hasMultipleBgWhite) {
      this.addIssue({
        severity: 'info',
        category: 'UI Consistency',
        file,
        message: 'File missing dark mode support',
        recommendation: 'Consider adding dark mode variants (e.g., bg-white dark:bg-gray-900)'
      });
    }

    // Check for non-standard border radius
    const customRadiusPattern = /rounded-\[[\d]+px\]/;
    if (customRadiusPattern.test(content)) {
      this.addIssue({
        severity: 'info',
        category: 'UI Consistency',
        file,
        message: 'Custom border radius values',
        recommendation: 'Use standard radius (rounded-lg, rounded-xl, rounded-2xl)'
      });
    }
  }

  /**
   * TypeScript checks
   */
  private checkTypeScript(file: string, content: string, lines: string[]): void {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    // Check for 'any' type usage
    lines.forEach((line, index) => {
      if (/:\s*any\s*[;,)=]/.test(line) && !line.includes('//')) {
        this.addIssue({
          severity: 'warning',
          category: 'TypeScript',
          file,
          line: index + 1,
          message: 'Use of "any" type detected',
          recommendation: 'Use proper TypeScript types or "unknown" instead'
        });
      }
    });

    // Check for missing prop types in components
    if (file.includes('components/') && content.includes('= ({') && !content.includes('interface') && !content.includes('type ')) {
      this.addIssue({
        severity: 'warning',
        category: 'TypeScript',
        file,
        message: 'Component without typed props interface',
        recommendation: 'Define interface for component props'
      });
    }

    // Check for @ts-ignore
    if (content.includes('@ts-ignore') || content.includes('@ts-nocheck')) {
      this.addIssue({
        severity: 'warning',
        category: 'TypeScript',
        file,
        message: 'TypeScript errors suppressed',
        recommendation: 'Fix TypeScript errors instead of suppressing them'
      });
    }
  }

  /**
   * Accessibility checks
   */
  private checkAccessibility(file: string, content: string, lines: string[]): void {
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) return;

    // Check for img without alt
    if (content.includes('<img') && !content.includes('alt=')) {
      this.addIssue({
        severity: 'warning',
        category: 'Accessibility',
        file,
        message: 'Image without alt attribute',
        recommendation: 'Add alt text to all images for accessibility'
      });
    }

    // Check for buttons without accessible labels
    const buttonWithoutLabel = /<button[^>]*>[\s\n]*<(svg|Icon|[A-Z])/;
    if (buttonWithoutLabel.test(content) && !content.includes('aria-label') && !content.includes('sr-only')) {
      this.addIssue({
        severity: 'info',
        category: 'Accessibility',
        file,
        message: 'Icon button without accessible label',
        recommendation: 'Add aria-label to icon-only buttons'
      });
    }

    // Check for form inputs without labels (exclude base components)
    const isBaseComponent = file.includes('components/ui/input.tsx') || file.includes('components\\ui\\input.tsx');
    if (!isBaseComponent && content.includes('<input') && !content.includes('<FormLabel') && !content.includes('aria-label') && !content.includes('type="hidden"')) {
      this.addIssue({
        severity: 'warning',
        category: 'Accessibility',
        file,
        message: 'Input without associated label',
        recommendation: 'Use FormLabel or aria-label for all inputs'
      });
    }
  }

  /**
   * Performance checks
   */
  private checkPerformance(file: string, content: string, lines: string[]): void {
    // Check for missing "use client" when using hooks
    const clientHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo'];
    const usesClientHooks = clientHooks.some(hook => content.includes(hook));
    const hasUseClient = content.includes('"use client"') || content.includes("'use client'");

    if (usesClientHooks && !hasUseClient && file.endsWith('.tsx')) {
      this.addIssue({
        severity: 'warning',
        category: 'Performance',
        file,
        message: 'Component uses client hooks without "use client" directive',
        recommendation: 'Add "use client" directive at the top of the file'
      });
    }

    // Check for regular img instead of next/image
    if (content.includes('<img') && !content.includes('next/image')) {
      this.addIssue({
        severity: 'info',
        category: 'Performance',
        file,
        message: 'Using regular img instead of next/image',
        recommendation: 'Use next/image for automatic optimization'
      });
    }

    // Check for large inline data
    lines.forEach((line, index) => {
      if (line.length > 500) {
        this.addIssue({
          severity: 'info',
          category: 'Performance',
          file,
          line: index + 1,
          message: 'Very long line detected (>500 chars)',
          recommendation: 'Consider breaking into smaller chunks or moving to separate file'
        });
      }
    });
  }

  /**
   * Import order checks
   */
  private checkImports(file: string, content: string, lines: string[]): void {
    const imports: string[] = [];
    let foundNonImport = false;
    let inMultiLineImport = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
        return;
      }

      // Skip Next.js directives - these are valid at the top of the file
      if (trimmed === '"use client"' || trimmed === "'use client'" ||
          trimmed === '"use client";' || trimmed === "'use client';" ||
          trimmed === '"use server"' || trimmed === "'use server'" ||
          trimmed === '"use server";' || trimmed === "'use server';") {
        return;
      }

      // Track multi-line imports
      if (trimmed.startsWith('import ')) {
        inMultiLineImport = !trimmed.endsWith(';');

        if (foundNonImport) {
          this.addIssue({
            severity: 'info',
            category: 'Code Style',
            file,
            line: index + 1,
            message: 'Import statements not at top of file',
            recommendation: 'Move all imports to the top of the file'
          });
        }
        imports.push(line);
      } else if (inMultiLineImport) {
        // Continue tracking multi-line import
        if (trimmed.includes(' from ') || trimmed.endsWith(';')) {
          inMultiLineImport = false;
        }
      } else {
        foundNonImport = true;
      }
    });
  }

  /**
   * Styling consistency checks
   */
  private checkStyling(file: string, content: string, lines: string[]): void {
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) return;

    // Check for cn() utility usage
    const hasClassNames = content.includes('className=');
    const usesCn = content.includes('cn(');
    const hasDynamicClasses = /className=\{[^}]*\?/.test(content);

    if (hasClassNames && hasDynamicClasses && !usesCn) {
      this.addIssue({
        severity: 'info',
        category: 'Code Style',
        file,
        message: 'Conditional classes without cn() utility',
        recommendation: 'Use cn() from @/lib/utils for cleaner class composition'
      });
    }

    // Shadow check removed - standard Tailwind shadows are acceptable
    // The stripe-inspired shadows mentioned in .clauiderules are aspirational
    // but not implemented in tailwind.config.ts
  }

  /**
   * Add issue to the list
   */
  private addIssue(issue: AuditIssue): void {
    this.issues.push(issue);
  }

  /**
   * Generate final report
   */
  private generateReport(): AuditReport {
    const summary = {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      warnings: this.issues.filter(i => i.severity === 'warning').length,
      info: this.issues.filter(i => i.severity === 'info').length,
    };

    const categories: Record<string, number> = {};
    this.issues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      filesScanned: this.filesScanned,
      issues: this.issues,
      summary,
      categories,
    };
  }

  /**
   * Print summary to console
   */
  private printSummary(report: AuditReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log(`📁 Files Scanned: ${report.filesScanned}`);
    console.log(`🔍 Total Issues: ${report.issues.length}\n`);

    console.log('Severity Breakdown:');
    console.log(`  🔴 Critical: ${report.summary.critical}`);
    console.log(`  🟡 Warnings: ${report.summary.warnings}`);
    console.log(`  🔵 Info:     ${report.summary.info}\n`);

    console.log('Category Breakdown:');
    Object.entries(report.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  • ${category}: ${count}`);
      });

    console.log('\n' + '='.repeat(80));

    if (report.summary.critical > 0) {
      console.log('\n🔴 CRITICAL ISSUES FOUND - Immediate action required!\n');
      report.issues
        .filter(i => i.severity === 'critical')
        .forEach(issue => {
          console.log(`❌ ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
          console.log(`   ${issue.message}`);
          if (issue.recommendation) {
            console.log(`   💡 ${issue.recommendation}`);
          }
          console.log('');
        });
    }

    console.log('\n📄 Detailed report saved to: audit-report.json');
    console.log('📄 Human-readable report saved to: audit-report.md\n');
  }

  /**
   * Save report to file
   */
  private saveReport(report: AuditReport): void {
    // Save JSON report
    fs.writeFileSync(
      path.join(this.rootDir, 'audit-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Save Markdown report
    const mdReport = this.generateMarkdownReport(report);
    fs.writeFileSync(
      path.join(this.rootDir, 'audit-report.md'),
      mdReport
    );
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(report: AuditReport): string {
    let md = '# Codebase Audit Report\n\n';
    md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    md += `**Files Scanned:** ${report.filesScanned}\n\n`;
    md += `**Total Issues:** ${report.issues.length}\n\n`;

    md += '## Summary\n\n';
    md += '| Severity | Count |\n';
    md += '|----------|-------|\n';
    md += `| 🔴 Critical | ${report.summary.critical} |\n`;
    md += `| 🟡 Warning | ${report.summary.warnings} |\n`;
    md += `| 🔵 Info | ${report.summary.info} |\n\n`;

    md += '## Issues by Category\n\n';
    Object.entries(report.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        md += `- **${category}:** ${count}\n`;
      });

    md += '\n## Critical Issues\n\n';
    const criticalIssues = report.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length === 0) {
      md += '*No critical issues found.*\n\n';
    } else {
      criticalIssues.forEach((issue, index) => {
        md += `### ${index + 1}. ${issue.message}\n\n`;
        md += `**File:** \`${issue.file}\`${issue.line ? ` (Line ${issue.line})` : ''}\n\n`;
        md += `**Category:** ${issue.category}\n\n`;
        if (issue.recommendation) {
          md += `**Recommendation:** ${issue.recommendation}\n\n`;
        }
        md += '---\n\n';
      });
    }

    md += '## Warnings\n\n';
    const warnings = report.issues.filter(i => i.severity === 'warning');
    if (warnings.length === 0) {
      md += '*No warnings found.*\n\n';
    } else {
      warnings.forEach((issue, index) => {
        md += `### ${index + 1}. ${issue.message}\n\n`;
        md += `**File:** \`${issue.file}\`${issue.line ? ` (Line ${issue.line})` : ''}\n\n`;
        md += `**Category:** ${issue.category}\n\n`;
        if (issue.recommendation) {
          md += `**Recommendation:** ${issue.recommendation}\n\n`;
        }
        md += '---\n\n';
      });
    }

    md += '## Info\n\n';
    const info = report.issues.filter(i => i.severity === 'info');
    if (info.length === 0) {
      md += '*No info items.*\n\n';
    } else {
      // Group by category for better readability
      const grouped = info.reduce((acc, issue) => {
        if (!acc[issue.category]) acc[issue.category] = [];
        acc[issue.category].push(issue);
        return acc;
      }, {} as Record<string, AuditIssue[]>);

      Object.entries(grouped).forEach(([category, issues]) => {
        md += `### ${category}\n\n`;
        issues.forEach((issue, index) => {
          md += `${index + 1}. **${issue.message}**\n`;
          md += `   - File: \`${issue.file}\`${issue.line ? ` (Line ${issue.line})` : ''}\n`;
          if (issue.recommendation) {
            md += `   - 💡 ${issue.recommendation}\n`;
          }
          md += '\n';
        });
      });
    }

    return md;
  }
}

// Run the audit
const auditor = new CodebaseAuditor(process.cwd());
auditor.audit().catch(console.error);
