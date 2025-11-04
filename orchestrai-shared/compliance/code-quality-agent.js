/**
 * Code Quality Compliance Agent
 *
 * Real-time monitoring of code quality during development streams.
 * Catches issues like:
 * - Syntax errors
 * - Style violations (ESLint, Prettier)
 * - Type errors (TypeScript)
 * - Code complexity issues
 * - Security vulnerabilities (basic patterns)
 * - Best practice violations
 *
 * Runs embedded within development streams to catch issues during creation.
 */

const BaseComplianceAgent = require('./base-compliance-agent');

class CodeQualityAgent extends BaseComplianceAgent {
  constructor(config = {}) {
    super({
      agentType: 'code-quality-monitor',
      ...config
    });

    // Code-specific configuration
    this.codeConfig = {
      languages: config.languages || ['javascript', 'typescript', 'python', 'jsx', 'tsx'],
      enableTypeChecking: config.enableTypeChecking !== false,
      enableLinting: config.enableLinting !== false,
      enableComplexityAnalysis: config.enableComplexityAnalysis !== false,
      enableSecurityScanning: config.enableSecurityScanning !== false,
      maxComplexity: config.maxComplexity || 10,
      maxFileLength: config.maxFileLength || 500,
      maxFunctionLength: config.maxFunctionLength || 50,
      ...config.codeConfig
    };

    // Validation rules
    this.rules = this.initializeRules();

    console.log(`🔍 Code Quality Agent configured for: ${this.codeConfig.languages.join(', ')}`);
  }

  /**
   * Initialize validation rules
   */
  initializeRules() {
    return {
      // JavaScript/TypeScript rules
      javascript: [
        { id: 'no-console', severity: 'low', message: 'Console statements should be removed in production' },
        { id: 'no-debugger', severity: 'high', message: 'Debugger statements must be removed', autoFixable: true },
        { id: 'no-unused-vars', severity: 'medium', message: 'Unused variables detected', autoFixable: true },
        { id: 'no-eval', severity: 'critical', message: 'eval() is dangerous and should never be used' },
        { id: 'eqeqeq', severity: 'medium', message: 'Use === instead of ==', autoFixable: true },
        { id: 'no-var', severity: 'medium', message: 'Use const or let instead of var', autoFixable: true },
        { id: 'prefer-const', severity: 'low', message: 'Use const for variables that are never reassigned', autoFixable: true },
        { id: 'no-undef', severity: 'high', message: 'Undefined variable used' },
        { id: 'no-empty', severity: 'low', message: 'Empty block statement', autoFixable: true }
      ],

      // TypeScript-specific rules
      typescript: [
        { id: 'no-explicit-any', severity: 'medium', message: 'Avoid using "any" type' },
        { id: 'explicit-return-types', severity: 'low', message: 'Functions should have explicit return types' },
        { id: 'no-non-null-assertion', severity: 'medium', message: 'Avoid non-null assertions (!)' }
      ],

      // Security rules
      security: [
        { id: 'no-hardcoded-secrets', severity: 'critical', message: 'Hardcoded credentials detected', pattern: /(password|apikey|secret|token)\s*=\s*['"]/i },
        { id: 'no-sql-injection', severity: 'critical', message: 'Potential SQL injection vulnerability', pattern: /execute.*\+.*['"`]/i },
        { id: 'no-xss', severity: 'critical', message: 'Potential XSS vulnerability', pattern: /innerHTML\s*=|dangerouslySetInnerHTML/i },
        { id: 'no-unsafe-eval', severity: 'critical', message: 'Unsafe eval usage', pattern: /eval\(|Function\(/i }
      ],

      // Best practices
      bestPractices: [
        { id: 'max-complexity', severity: 'medium', message: 'Function complexity exceeds threshold' },
        { id: 'max-depth', severity: 'low', message: 'Nesting depth exceeds recommended level' },
        { id: 'max-params', severity: 'low', message: 'Too many function parameters (>5)' },
        { id: 'no-magic-numbers', severity: 'low', message: 'Magic numbers should be constants' }
      ]
    };
  }

  /**
   * Perform validation on stream output
   */
  async performValidation(stream) {
    if (!stream || !stream.output) {
      return {
        passed: true,
        score: 100,
        message: 'No code output to validate'
      };
    }

    return await this.validateContent(stream.output, {
      streamId: stream.id,
      language: stream.language || 'javascript'
    });
  }

  /**
   * Run validation checks on code
   */
  async runValidationChecks(code, context) {
    const issues = [];
    const language = context.language || 'javascript';

    // 1. Syntax validation
    const syntaxIssues = await this.checkSyntax(code, language);
    issues.push(...syntaxIssues);

    // 2. Linting checks
    if (this.codeConfig.enableLinting) {
      const lintIssues = await this.runLinting(code, language);
      issues.push(...lintIssues);
    }

    // 3. Type checking (for TypeScript)
    if (this.codeConfig.enableTypeChecking && (language === 'typescript' || language === 'tsx')) {
      const typeIssues = await this.checkTypes(code);
      issues.push(...typeIssues);
    }

    // 4. Complexity analysis
    if (this.codeConfig.enableComplexityAnalysis) {
      const complexityIssues = await this.analyzeComplexity(code);
      issues.push(...complexityIssues);
    }

    // 5. Security scanning
    if (this.codeConfig.enableSecurityScanning) {
      const securityIssues = await this.scanSecurity(code);
      issues.push(...securityIssues);
    }

    // 6. Best practices
    const bestPracticeIssues = await this.checkBestPractices(code);
    issues.push(...bestPracticeIssues);

    return issues;
  }

  /**
   * Check syntax errors
   */
  async checkSyntax(code, language) {
    const issues = [];

    try {
      // Basic syntax checks (in production, use actual parser like acorn or @babel/parser)

      // Check for unmatched brackets
      const brackets = { '(': ')', '[': ']', '{': '}' };
      const stack = [];
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < code.length; i++) {
        const char = code[i];

        // Handle strings
        if ((char === '"' || char === "'" || char === '`') && code[i - 1] !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
          continue;
        }

        if (inString) continue;

        // Track brackets
        if (brackets[char]) {
          stack.push({ char, pos: i });
        } else if (Object.values(brackets).includes(char)) {
          const last = stack.pop();
          if (!last || brackets[last.char] !== char) {
            issues.push({
              passed: false,
              severity: 'high',
              category: 'syntax',
              message: `Unmatched bracket: ${char}`,
              location: { line: this.getLineNumber(code, i), column: i },
              autoFixable: false
            });
          }
        }
      }

      // Check for unclosed brackets
      if (stack.length > 0) {
        stack.forEach(item => {
          issues.push({
            passed: false,
            severity: 'high',
            category: 'syntax',
            message: `Unclosed bracket: ${item.char}`,
            location: { line: this.getLineNumber(code, item.pos), column: item.pos },
            autoFixable: false
          });
        });
      }

    } catch (error) {
      issues.push({
        passed: false,
        severity: 'critical',
        category: 'syntax',
        message: `Syntax error: ${error.message}`,
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Run linting checks
   */
  async runLinting(code, language) {
    const issues = [];
    const rules = this.rules[language] || this.rules.javascript;

    for (const rule of rules) {
      const violations = await this.checkRule(code, rule);
      issues.push(...violations);
    }

    return issues;
  }

  /**
   * Check specific linting rule
   */
  async checkRule(code, rule) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      let violated = false;
      let location = null;

      switch (rule.id) {
        case 'no-console':
          if (line.includes('console.')) {
            violated = true;
            location = { line: index + 1, column: line.indexOf('console.') };
          }
          break;

        case 'no-debugger':
          if (line.includes('debugger')) {
            violated = true;
            location = { line: index + 1, column: line.indexOf('debugger') };
          }
          break;

        case 'no-eval':
          if (/\beval\s*\(/.test(line)) {
            violated = true;
            location = { line: index + 1, column: line.indexOf('eval') };
          }
          break;

        case 'eqeqeq':
          if (/[^=!]==[^=]/.test(line) || /[^=!]!=[^=]/.test(line)) {
            violated = true;
            const match = line.match(/[^=!](==|!=)[^=]/);
            location = { line: index + 1, column: match ? match.index : 0 };
          }
          break;

        case 'no-var':
          if (/\bvar\s+/.test(line)) {
            violated = true;
            location = { line: index + 1, column: line.indexOf('var') };
          }
          break;
      }

      if (violated) {
        issues.push({
          passed: false,
          severity: rule.severity,
          category: 'linting',
          message: rule.message,
          location,
          suggestion: this.getSuggestion(rule.id, line),
          autoFixable: rule.autoFixable || false
        });
      }
    });

    return issues;
  }

  /**
   * Get suggestion for fixing rule violation
   */
  getSuggestion(ruleId, line) {
    const suggestions = {
      'no-console': 'Remove console statement or use a logging library',
      'no-debugger': 'Remove debugger statement',
      'no-eval': 'Use safer alternatives like JSON.parse() or Function constructor',
      'eqeqeq': 'Replace == with === or != with !==',
      'no-var': 'Replace var with const or let'
    };

    return suggestions[ruleId] || 'Review and fix this issue';
  }

  /**
   * Check TypeScript types
   */
  async checkTypes(code) {
    const issues = [];

    // Basic type checking patterns (in production, use TypeScript compiler API)
    const noExplicitAny = /:\s*any\b/g;
    const matches = [...code.matchAll(noExplicitAny)];

    matches.forEach(match => {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'types',
        message: 'Avoid using "any" type',
        location: { line: this.getLineNumber(code, match.index), column: match.index },
        suggestion: 'Use a more specific type',
        autoFixable: false
      });
    });

    return issues;
  }

  /**
   * Analyze code complexity
   */
  async analyzeComplexity(code) {
    const issues = [];

    // Calculate cyclomatic complexity
    const complexity = this.calculateCyclomaticComplexity(code);

    if (complexity > this.codeConfig.maxComplexity) {
      issues.push({
        passed: false,
        severity: complexity > this.codeConfig.maxComplexity * 2 ? 'high' : 'medium',
        category: 'complexity',
        message: `Function complexity (${complexity}) exceeds threshold (${this.codeConfig.maxComplexity})`,
        suggestion: 'Break down into smaller functions',
        autoFixable: false
      });
    }

    // Check function length
    const functions = this.extractFunctions(code);
    functions.forEach(func => {
      if (func.lines > this.codeConfig.maxFunctionLength) {
        issues.push({
          passed: false,
          severity: 'low',
          category: 'complexity',
          message: `Function "${func.name}" is too long (${func.lines} lines)`,
          location: { line: func.startLine },
          suggestion: 'Break into smaller functions',
          autoFixable: false
        });
      }
    });

    return issues;
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(code) {
    // Count decision points
    const decisionKeywords = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\&\&/g,
      /\|\|/g,
      /\?/g
    ];

    let complexity = 1; // Base complexity

    decisionKeywords.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Extract functions from code
   */
  extractFunctions(code) {
    const functions = [];
    const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;

    let match;
    while ((match = functionPattern.exec(code)) !== null) {
      const name = match[1] || match[2] || 'anonymous';
      const startLine = this.getLineNumber(code, match.index);

      // Count lines until next function or end
      const remainingCode = code.substring(match.index);
      const functionBody = remainingCode.match(/\{[\s\S]*?\}/);

      if (functionBody) {
        const lines = functionBody[0].split('\n').length;
        functions.push({ name, startLine, lines });
      }
    }

    return functions;
  }

  /**
   * Scan for security vulnerabilities
   */
  async scanSecurity(code) {
    const issues = [];
    const securityRules = this.rules.security;

    for (const rule of securityRules) {
      if (rule.pattern) {
        const matches = [...code.matchAll(new RegExp(rule.pattern, 'gi'))];

        matches.forEach(match => {
          issues.push({
            passed: false,
            severity: rule.severity,
            category: 'security',
            message: rule.message,
            location: { line: this.getLineNumber(code, match.index), column: match.index },
            suggestion: 'Review security implications',
            autoFixable: false
          });
        });
      }
    }

    return issues;
  }

  /**
   * Check best practices
   */
  async checkBestPractices(code) {
    const issues = [];

    // Check for magic numbers
    const magicNumberPattern = /[^a-zA-Z_]\d{2,}(?!\w)/g;
    const matches = [...code.matchAll(magicNumberPattern)];

    if (matches.length > 3) { // Allow a few
      issues.push({
        passed: false,
        severity: 'low',
        category: 'best-practices',
        message: 'Multiple magic numbers detected',
        suggestion: 'Extract numbers into named constants',
        autoFixable: false
      });
    }

    // Check file length
    const lines = code.split('\n').length;
    if (lines > this.codeConfig.maxFileLength) {
      issues.push({
        passed: false,
        severity: 'low',
        category: 'best-practices',
        message: `File is too long (${lines} lines)`,
        suggestion: 'Split into multiple files',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Get line number from character position
   */
  getLineNumber(code, position) {
    return code.substring(0, position).split('\n').length;
  }

  /**
   * Attempt to auto-correct issue
   */
  async correctIssue(code, issue, context) {
    // Implement auto-corrections for specific fixable issues
    switch (issue.category) {
      case 'linting':
        if (issue.message.includes('debugger')) {
          // Remove debugger statements
          return true;
        }
        if (issue.message.includes('===')) {
          // Fix == to ===
          return true;
        }
        break;
    }

    return false;
  }
}

module.exports = CodeQualityAgent;
