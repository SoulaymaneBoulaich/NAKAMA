---
trigger: always_on
---

# AI Agent Workflows & Rules for Website Development
## Mandatory Guidelines for Google's Antigravity IDE

---

## 🎯 CORE PRINCIPLES

The AI agent MUST adhere to these immutable principles:

1. **Zero Tolerance for Incomplete Code** - No placeholders, no TODO comments in production
2. **Security First** - Every input is untrusted, every output is validated
3. **Functional Completeness** - All features must work end-to-end before deployment
4. **Error-Free Delivery** - Code must pass all validation gates before proceeding

---

## 📋 PHASE 1: PRE-DEVELOPMENT WORKFLOW

### 1.1 Requirements Analysis (MANDATORY)

**The agent MUST:**

- [ ] Extract and document ALL functional requirements
- [ ] Identify all user inputs and data flows
- [ ] Map all external dependencies (APIs, databases, third-party services)
- [ ] Create a security threat model
- [ ] Define success criteria with measurable metrics
- [ ] Document all edge cases and error scenarios

**RULE:** No coding begins until requirements are 100% documented and validated.

### 1.2 Architecture Planning (MANDATORY)

**The agent MUST:**

- [ ] Design complete system architecture diagram
- [ ] Define all API endpoints with request/response schemas
- [ ] Plan database schema with proper normalization
- [ ] Identify authentication/authorization strategy
- [ ] Design error handling and logging strategy
- [ ] Plan for scalability and performance
- [ ] Document data validation rules for every input point

**RULE:** Architecture must be reviewed against OWASP Top 10 vulnerabilities before proceeding.

---

## 💻 PHASE 2: DEVELOPMENT WORKFLOW

### 2.1 Code Implementation Rules (STRICTLY ENFORCED)

**The agent is OBLIGED to:**

#### Security Rules (NON-NEGOTIABLE)

1. **Input Validation**
   - Validate ALL user inputs on both client and server side
   - Use whitelist validation (allow known good, reject everything else)
   - Implement length limits on all text inputs
   - Sanitize all inputs before processing
   - Never trust data from client-side validation alone

2. **SQL Injection Prevention**
   - Use ONLY parameterized queries or prepared statements
   - NEVER concatenate user input into SQL queries
   - Implement ORM with proper escaping
   - Validate all database inputs

3. **XSS Prevention**
   - Encode all output displayed in HTML context
   - Use Content Security Policy (CSP) headers
   - Sanitize HTML input using trusted libraries
   - Escape JavaScript context outputs

4. **CSRF Protection**
   - Implement anti-CSRF tokens for all state-changing operations
   - Use SameSite cookie attributes
   - Verify origin headers

5. **Authentication & Authorization**
   - Implement secure password hashing (bcrypt, Argon2)
   - Use strong session management
   - Implement proper access control checks
   - Never store sensitive data in client-side storage without encryption
   - Implement rate limiting on authentication endpoints

6. **Data Exposure Prevention**
   - Never expose sensitive data in URLs
   - Implement proper error messages (no stack traces in production)
   - Use HTTPS for all communications
   - Implement proper CORS policies

#### Code Quality Rules (MANDATORY)

7. **No Empty Code Blocks**
   - Every function must have implementation
   - No empty catch blocks (must log or handle errors)
   - No commented-out code in production
   - No unreachable code

8. **Error Handling**
   - Wrap ALL external calls in try-catch blocks
   - Provide meaningful error messages
   - Log all errors with context
   - Implement graceful degradation
   - Never expose internal errors to users

9. **Data Validation**
   - Validate data types for all variables
   - Check for null/undefined before use
   - Validate array lengths before access
   - Validate object properties before access

10. **Complete Implementation**
    - All functions must have return statements
    - All promises must have error handlers
    - All async operations must be awaited or handled
    - All form submissions must have handlers
    - All API calls must have success and error handlers

### 2.2 Testing Workflow (MANDATORY BEFORE PROCEEDING)

**The agent MUST execute:**

#### Unit Testing
- [ ] Test every function with valid inputs
- [ ] Test every function with invalid inputs
- [ ] Test edge cases (empty strings, null, undefined, extreme values)
- [ ] Test error handling paths
- [ ] Achieve minimum 80% code coverage

#### Integration Testing
- [ ] Test all API endpoints
- [ ] Test database operations (CRUD)
- [ ] Test authentication flows
- [ ] Test authorization rules
- [ ] Test third-party integrations

#### Security Testing
- [ ] Test for SQL injection on all inputs
- [ ] Test for XSS on all outputs
- [ ] Test for CSRF vulnerabilities
- [ ] Test authentication bypass attempts
- [ ] Test authorization escalation attempts
- [ ] Test file upload vulnerabilities
- [ ] Test session management
- [ ] Test rate limiting

#### Functional Testing
- [ ] Test all user workflows end-to-end
- [ ] Test all form submissions
- [ ] Test all navigation paths
- [ ] Test responsive design on multiple devices
- [ ] Test browser compatibility
- [ ] Test accessibility (WCAG 2.1)

**RULE:** Code that fails ANY test MUST NOT proceed to next phase.

---

## 🔍 PHASE 3: CODE REVIEW & VALIDATION

### 3.1 Automated Validation Checklist

**The agent MUST verify:**

#### Completeness Check
- [ ] No TODO, FIXME, or placeholder comments
- [ ] No console.log or debug statements
- [ ] No hardcoded credentials or secrets
- [ ] No empty functions or classes
- [ ] All imports are used
- [ ] All variables are initialized
- [ ] All functions return appropriate values

#### Security Audit
- [ ] Run static analysis security scanner
- [ ] Check for known vulnerable dependencies
- [ ] Verify all secrets are in environment variables
- [ ] Verify no sensitive data in logs
- [ ] Verify proper encryption for sensitive data
- [ ] Verify secure communication protocols

#### Performance Check
- [ ] No N+1 query problems
- [ ] Proper database indexing
- [ ] Optimized asset loading
- [ ] Lazy loading implemented where appropriate
- [ ] No memory leaks
- [ ] Proper caching strategies

#### Code Quality
- [ ] Consistent code formatting
- [ ] Meaningful variable and function names
- [ ] Proper code comments for complex logic
- [ ] DRY principle followed (no code duplication)
- [ ] SOLID principles followed
- [ ] Proper separation of concerns

---

## 🚀 PHASE 4: DEPLOYMENT WORKFLOW

### 4.1 Pre-Deployment Checklist (MANDATORY)

**The agent MUST complete:**

- [ ] All tests passing (100% success rate)
- [ ] Security audit completed with no critical issues
- [ ] Performance benchmarks met
- [ ] Error handling tested in all scenarios
- [ ] Logging and monitoring configured
- [ ] Backup and recovery procedures tested
- [ ] Environment variables configured
- [ ] SSL/TLS certificates configured
- [ ] Database migrations tested
- [ ] Rollback plan documented

### 4.2 Deployment Validation

**The agent MUST verify post-deployment:**

- [ ] All endpoints responding correctly
- [ ] Database connections working
- [ ] Authentication system functional
- [ ] Third-party integrations operational
- [ ] Error logging capturing issues
- [ ] Performance metrics within acceptable range
- [ ] Security headers properly configured
- [ ] HTTPS enforced
- [ ] No console errors in production

---

## ⚠️ CRITICAL BLOCKING RULES

**The agent MUST STOP and FIX immediately if:**

1. **Any security vulnerability is detected** - No exceptions
2. **Any test fails** - Fix before proceeding
3. **Any endpoint returns 500 errors** - Debug and resolve
4. **Any database query is vulnerable to injection** - Rewrite with parameterization
5. **Any user input is not validated** - Implement validation
6. **Any error is not properly handled** - Add error handling
7. **Any sensitive data is exposed** - Implement proper protection
8. **Any code block is empty or incomplete** - Complete implementation
9. **Any dependency has known vulnerabilities** - Update or replace
10. **Any authentication/authorization is bypassable** - Fix security logic

---

## 📝 DOCUMENTATION REQUIREMENTS

**The agent MUST create:**

1. **API Documentation**
   - All endpoints documented
   - Request/response examples
   - Error codes explained
   - Authentication requirements

2. **Database Documentation**
   - Schema diagrams
   - Relationship documentation
   - Index strategies
   - Migration procedures

3. **Security Documentation**
   - Security measures implemented
   - Authentication flow
   - Authorization model
   - Data protection strategies

4. **Deployment Documentation**
   - Environment setup
   - Configuration requirements
   - Deployment procedures
   - Rollback procedures

---

## 🔒 DATA PROTECTION RULES

**The agent MUST ensure:**

1. **Input Sanitization**
   - Remove/encode HTML tags from user input
   - Strip dangerous characters
   - Normalize Unicode characters
   - Limit input length

2. **Output Encoding**
   - HTML encode for HTML context
   - JavaScript encode for JS context
   - URL encode for URL parameters
   - SQL escape for database queries

3. **Data Storage**
   - Encrypt sensitive data at rest
   - Hash passwords with strong algorithms
   - Never store plaintext passwords
   - Implement proper key management

4. **Data Transmission**
   - Use HTTPS for all communications
   - Implement proper TLS configuration
   - Validate SSL certificates
   - Use secure WebSocket connections

---

## 🧪 CONTINUOUS VALIDATION

**The agent MUST implement:**

1. **Automated Testing**
   - Run tests on every code change
   - Automated security scans
   - Performance regression tests
   - Accessibility audits

2. **Monitoring**
   - Error rate monitoring
   - Performance monitoring
   - Security event logging
   - User activity tracking (anonymized)

3. **Maintenance**
   - Regular dependency updates
   - Security patch application
   - Performance optimization
   - Code refactoring for improvements

---

## ✅ SUCCESS CRITERIA

**Before marking website as "fully functional," the agent MUST verify:**

- [ ] 100% test coverage on critical paths
- [ ] Zero security vulnerabilities (critical/high severity)
- [ ] Zero runtime errors in production environment
- [ ] All user workflows function correctly
- [ ] Performance metrics meet requirements
- [ ] All documentation is complete and accurate
- [ ] Disaster recovery procedures are tested
- [ ] Accessibility standards are met
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile responsiveness verified

---

## 🚫 FORBIDDEN PRACTICES

**The agent MUST NEVER:**

1. Leave placeholder code or comments
2. Skip input validation
3. Use string concatenation for SQL queries
4. Store passwords in plaintext
5. Expose stack traces to users
6. Skip error handling
7. Leave debug code in production
8. Hardcode sensitive information
9. Skip security testing
10. Deploy code that hasn't passed all tests
11. Ignore compiler/linter warnings
12. Use deprecated or vulnerable dependencies
13. Implement weak authentication mechanisms
14. Skip authorization checks
15. Trust client-side validation alone

---

## 📊 QUALITY GATES

**Code must pass through these gates sequentially:**

```
Gate 1: Requirements Complete ✓
   ↓
Gate 2: Architecture Approved ✓
   ↓
Gate 3: Implementation Complete ✓
   ↓
Gate 4: Unit Tests Pass ✓
   ↓
Gate 5: Integration Tests Pass ✓
   ↓
Gate 6: Security Audit Pass ✓
   ↓
Gate 7: Performance Tests Pass ✓
   ↓
Gate 8: Code Review Complete ✓
   ↓
Gate 9: Documentation Complete ✓
   ↓
Gate 10: Deployment Validation ✓
   ↓
PRODUCTION READY ✅
```

**RULE:** No gate can be skipped. Failure at any gate sends code back to development.

---

## 🎯 FINAL MANDATE

This AI agent is **OBLIGATED** to produce websites that are:

- ✅ **Fully Functional** - Every feature works as intended
- ✅ **Bug-Free** - No runtime errors or exceptions
- ✅ **Secure** - Protected against all common vulnerabilities
- ✅ **Complete** - No empty code b