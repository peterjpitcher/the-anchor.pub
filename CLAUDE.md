# CLAUDE.md - Universal AI Assistant Development Guide v4.0

**CRITICAL: This file provides comprehensive guidance to AI assistants (Claude, GPT, Copilot, etc.) when working with The Anchor Pub codebase.**

---

# === PROJECT PROFILE (AI MUST load first) ===
```yaml
# The Anchor Pub - Restaurant Website & Booking System
name: the-anchor.pub
stack: node              # values: generic|node|python|go|java|dotnet|rust|mixed
runtime: node-20         # e.g., node-20|python-3.11|go-1.21|java-17|dotnet-8
package_manager: npm     # npm|yarn|pnpm|pip|poetry|uv|cargo|maven|gradle|dotnet

commands:
  install: "npm install"           
  build: "npm run build"           
  test: "npm test"                
  lint: "npm run lint"            
  typecheck: "npx tsc --noEmit"  
  format: "prettier --write ."    
  start: "npm start"              
  dev: "npm run dev"              

paths:
  src: "./app"                   # Next.js App Router
  tests: "./tests"               # Test files directory
  docs: "./docs"                 # Documentation directory
  config: "./"                   # Configuration files

artifacts:
  server: true
  cli: false
  library: false
  frontend: true
  mobile: false
  
quality_bars:
  coverage_min: 80               # Minimum test coverage percentage
  complexity_max: 10             # Maximum cyclomatic complexity
  duplication_max: 5             # Maximum duplicate code percentage
  p95_latency_ms: 300           # 95th percentile latency target
  error_budget_pct: 1           # Maximum error rate percentage
  bundle_budget_kb: 200         # Maximum bundle size in KB
  memory_budget_mb: 512         # Maximum memory usage in MB
  
security:
  data_classes: ["public", "internal", "confidential", "pii"]
  secrets_scanning: true
  dependency_check: true
  sast_enabled: true
  api_key_pattern: "ANCHOR_API_KEY|NEXT_PUBLIC_GTM_ID|NEXT_PUBLIC_AVIATIONSTACK_API_KEY"
  
observability:
  logging_level: "info"          # debug|info|warn|error
  tracing_enabled: true
  metrics_enabled: true
  health_endpoint: "/api/health"
  analytics: "Google Tag Manager"
  
release:
  strategy: "canary"             # canary|blue-green|rolling|manual
  feature_flags: false
  rollback_window: "30m"
  hosting: "Vercel"
  
conventions:
  naming: "camelCase"            # camelCase|snake_case|PascalCase|kebab-case
  indent: 2                      # Spaces for indentation
  quotes: "single"               # single|double
  semicolons: false              # true|false (for applicable languages)
  
# Project-Specific Configuration
technology_stack:
  framework: "Next.js 14.2.3"
  language: "TypeScript"
  styling: "Tailwind CSS"
  components: "CVA (class-variance-authority)"
  analytics: "Google Tag Manager"
  external_api: "management.orangejelly.co.uk"
  dns: "Cloudflare"
  hosting: "Vercel"
```

---

## 📑 Document Structure

**Section 1: Core Foundations**
- Project Profile & Configuration
- Agent Behaviour Contract
- Definition of Ready (DoR)
- Definition of Done (DoD)
- Ethics & Safety Stop Conditions

**Section 2: Development Workflow**
- Task Complexity Assessment
- Incremental Development Philosophy
- Priority & Focus Management
- Command Adapter Matrix
- Verification Pipeline

**Section 3: AI Optimization**
- Context Window Management
- Prompt Engineering Patterns
- Model-Specific Guidance
- Hallucination Prevention
- Cost Controls

**Section 4: Engineering Standards**
- Non-Functional Requirements
- Resilience Patterns
- Observability Blueprint
- Security & Governance
- API Contracts

**Section 5: Quality Assurance**
- Test Strategy
- Test Data Management
- Performance Validation
- Accessibility Standards
- Regression Prevention

**Section 6: Operations**
- Release Management
- Rollback Procedures
- Monitoring & Alerting
- Incident Response
- Documentation

**Section 7: The Anchor Specific**
- Critical Business Rules
- SEO & Domain Configuration
- Brand Standards
- API Integration Rules
- Common Tasks & Patterns

---

## 🤖 Agent Behaviour Contract

### Core Directives
1. **Do ONLY what is asked** - No unsolicited improvements or additions
2. **Ask ONE clarifying question maximum** - If unclear, proceed with safest minimal implementation
3. **Record EVERY assumption** - Document in PR/commit messages
4. **One concern per changeset** - If second concern emerges, park it
5. **Fail safely** - When in doubt, stop and request human approval

### Source of Truth Hierarchy
```
1. Project Profile (above)
2. Explicit task instructions  
3. Existing code patterns
4. Industry best practices
5. Framework defaults
```

### Decision Recording
Every non-trivial decision MUST be documented:
```markdown
Decision: [what was decided]
Reason: [why this option]
Alternatives: [what else was considered]
Consequences: [impact and trade-offs]
```

### When Uncertain Protocol
```
1. Ask ONE precise, specific question
2. Wait 30 seconds for response
3. If no response: proceed with lowest-risk minimal change
4. Document assumption clearly
5. Add TODO marker for human review
```

---

## ✅ Definition of Ready (DoR)

**MANDATORY before ANY coding begins:**

### Requirements Checklist
- [ ] **Problem statement written** - Clear description of issue/need
- [ ] **Success criteria defined** - Measurable definition of "done"
- [ ] **User story clear** - "As a... I want... So that..."
- [ ] **Acceptance criteria listed** - Specific testable requirements

### Technical Checklist  
- [ ] **Inputs/outputs identified** - Data flow documented
- [ ] **Data classes marked** - PII/confidential/internal/public
- [ ] **Dependencies identified** - External services/libraries needed
- [ ] **API contracts defined** - Request/response formats (if applicable)

### Risk & Quality Checklist
- [ ] **Failure modes listed** - What can go wrong?
- [ ] **Rollback strategy defined** - How to undo if needed
- [ ] **Test oracle defined** - What proves it works?
- [ ] **Performance targets set** - Latency/throughput requirements
- [ ] **Security requirements clear** - Auth/authz/encryption needs

### DoR Validation Gate
```yaml
IF any_checklist_item == unchecked:
  status: NOT_READY
  action: Request missing information
ELSE:
  status: READY
  action: Proceed to implementation
```

---

## 🎯 Definition of Done (DoD)

**A feature is ONLY complete when ALL items pass:**

### Code Quality Gates
- ✅ **Builds successfully** - No compilation/build errors
- ✅ **All tests pass** - Unit, integration, and e2e tests green
- ✅ **Coverage meets minimum** - Per quality_bars.coverage_min
- ✅ **No linting errors** - Clean static analysis
- ✅ **Type checks pass** - If applicable to stack
- ✅ **Complexity within limits** - Per quality_bars.complexity_max

### Security Gates
- ✅ **No hardcoded secrets** - Verified by scanning
- ✅ **Dependencies secure** - No critical vulnerabilities
- ✅ **Input validation complete** - All user inputs sanitized
- ✅ **Auth checks in place** - Proper authorization verified

### Performance Gates
- ✅ **Latency within budget** - P95 < quality_bars.p95_latency_ms
- ✅ **Memory within budget** - Peak < quality_bars.memory_budget_mb
- ✅ **Bundle size acceptable** - If frontend, < quality_bars.bundle_budget_kb
- ✅ **No performance regression** - Compared to baseline

### Documentation Gates
- ✅ **Code commented** - Complex logic explained
- ✅ **API documented** - OpenAPI/comments as appropriate
- ✅ **README updated** - If new setup/config needed
- ✅ **ADR written** - For significant decisions

---

## 🛑 Ethics & Safety Stop Conditions

### HARD STOP - Require Human Approval
**AI MUST stop and request explicit approval before:**

1. **Data Destruction Risk**
   - Any operation that could DELETE user data
   - Schema migrations that drop columns/tables
   - Bulk update operations affecting > 1000 records

2. **Security Degradation**
   - Disabling authentication/authorization
   - Removing encryption
   - Exposing internal APIs publicly
   - Handling data above current classification level

3. **Privacy Violation Risk**
   - Logging PII data
   - Sending PII to external services
   - Storing PII in new locations
   - Changing data retention policies

4. **Legal/Compliance Risk**
   - Using GPL/AGPL code in proprietary projects
   - Violating documented compliance requirements
   - Processing data across regulatory boundaries

5. **Availability Risk**
   - Changes that could cause > 1 minute downtime
   - Modifications to critical path code
   - Database migrations on > 1GB tables
   - Rate limit changes that could cause DoS

### Stop Condition Protocol
```
WHEN stop_condition_detected:
  1. HALT all changes
  2. Document the risk clearly
  3. Request explicit approval with:
     - Risk description
     - Potential impact
     - Mitigation options
  4. Wait for human decision
  5. Proceed ONLY with written approval
```

---

## 📊 Command Adapter Matrix

### Stack-Agnostic Command Mapping
**AI MUST use this table to translate commands based on Project Profile `stack` value:**

| Intent | Node | Python | Go | Java | .NET | Rust |
|--------|------|--------|----|----|------|------|
| **Install** | `npm install` | `pip install -r requirements.txt` | `go mod download` | `./gradlew dependencies` | `dotnet restore` | `cargo fetch` |
| **Build** | `npm run build` | `python -m build` | `go build ./...` | `./gradlew build` | `dotnet build` | `cargo build --release` |
| **Test** | `npm test` | `pytest` | `go test ./...` | `./gradlew test` | `dotnet test` | `cargo test` |
| **Lint** | `eslint .` | `ruff check .` | `golangci-lint run` | `./gradlew check` | `dotnet format --verify` | `cargo clippy` |
| **Format** | `prettier --write .` | `black . && isort .` | `gofmt -w .` | `./gradlew spotlessApply` | `dotnet format` | `cargo fmt` |
| **Type Check** | `tsc --noEmit` | `mypy . or pyright` | N/A | N/A | N/A | `cargo check` |
| **Run Dev** | `npm run dev` | `python app.py` | `go run .` | `./gradlew bootRun` | `dotnet run` | `cargo run` |
| **Package** | `npm pack` | `python -m build` | `go build -o app` | `./gradlew jar` | `dotnet publish` | `cargo build --release` |
| **Clean** | `rm -rf node_modules dist` | `rm -rf __pycache__ dist` | `go clean` | `./gradlew clean` | `dotnet clean` | `cargo clean` |
| **Audit** | `npm audit` | `pip-audit` | `go list -m all \| nancy` | `./gradlew dependencyCheck` | `dotnet list package --vulnerable` | `cargo audit` |

### The Anchor Specific Commands
```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Testing
npm test                  # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:crawl       # E2E tests (Playwright)
npm run test:crawl:ui    # E2E with UI

# Analysis & Debugging
npm run analyze              # Bundle size analysis
npm run analyze:browser      # Client bundle
npm run analyze:server       # Server bundle

# Type checking
npx tsc --noEmit            # TypeScript check
npx next lint               # Next.js linting
```

---

## 🔍 Task Complexity Assessment

### Complexity Scoring Matrix
| Factor | Weight | Score 1 | Score 3 | Score 5 |
|--------|--------|---------|---------|---------|
| **Files Modified** | 2x | 1 file | 2-5 files | 6+ files |
| **Lines of Code** | 1x | < 50 | 50-200 | > 200 |
| **External Dependencies** | 3x | None | 1-2 | 3+ |
| **Data Migration** | 5x | None | Schema change | Data transform |
| **Breaking Changes** | 4x | None | Internal only | Public API |
| **Security Surface** | 3x | None | Auth check | New auth flow |

### Complexity Response Protocol
```
Total Score = Σ(Factor Weight × Factor Score)

0-10 points:  SIMPLE → Implement directly
11-30 points: MEDIUM → Break into 2-3 subtasks  
31-50 points: COMPLEX → Require design doc first
51+ points:   EPIC → Decompose into multiple PRs
```

### Task Breakdown Template
```markdown
## Task: [Name]
Complexity Score: [XX]

### Subtasks:
1. [ ] Preparation - [specific items]
2. [ ] Core Implementation - [main work]
3. [ ] Integration - [connection points]
4. [ ] Testing - [test scenarios]
5. [ ] Documentation - [what to document]
6. [ ] Cleanup - [tech debt items]
```

---

## 🏗️ Incremental Development Protocol

### The 3-Change Rule
**NEVER make more than 3 changes without validation**

```bash
change_count = 0
WHILE work_remaining:
  make_single_atomic_change()
  change_count++
  
  IF change_count >= 3:
    run_validation_suite()
    commit_if_green()
    change_count = 0
```

### Validation Suite (The Anchor Specific)
```bash
# 1. Syntax/Compile Check
npm run build || exit 1

# 2. Type Check
npx tsc --noEmit || exit 1  

# 3. Lint Check
npm run lint || exit 1

# 4. Test Check
npm test || exit 1

# 5. Security Check
grep -r "password\|secret\|key\|ANCHOR_API_KEY" --exclude-dir=.git . || true

# 6. Commit if all pass
git add -A && git commit -m "checkpoint: ${description}"
```

### Progressive Enhancement Stages
```
Stage 1: Minimal Working Implementation
  └── Just enough to prove concept works
  
Stage 2: Error Handling
  └── Add try/catch, validation, edge cases
  
Stage 3: Observability
  └── Add logging, metrics, traces
  
Stage 4: Performance
  └── Optimize queries, add caching
  
Stage 5: Polish
  └── Refactor, add tests, document
```

---

## 🛡️ Non-Functional Requirements (NFR) Pack

### 1. Reliability Requirements
```yaml
availability_target: 99.9%  # Three 9s
recovery_time_objective: < 5 minutes
recovery_point_objective: < 1 hour
data_durability: 99.999999999%  # 11 9s

patterns_required:
  - Retry with exponential backoff
  - Circuit breaker for external calls
  - Graceful degradation
  - Health checks
  - Timeout on all I/O
```

### 2. Performance Requirements  
```yaml
response_time:
  p50: < 100ms
  p95: < 300ms  # The Anchor specific
  p99: < 1000ms

throughput:
  minimum: 100 rps
  target: 1000 rps
  peak: 5000 rps

resource_limits:
  cpu: 2 cores
  memory: 512MB  # The Anchor specific
  disk_io: 100 MB/s
```

### 3. Security Requirements
```yaml
authentication: Required for all non-public endpoints
authorization: Role-based (RBAC) or Attribute-based (ABAC)
encryption:
  at_rest: AES-256
  in_transit: TLS 1.3+
  
input_validation:
  - Sanitize all user inputs
  - Parameterized queries only
  - Content-Security-Policy headers
  - CORS properly configured
  
secrets_management:
  - No hardcoded secrets
  - Use environment variables (.env.local)
  - Keys: ANCHOR_API_KEY, NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_AVIATIONSTACK_API_KEY
  - Rotate every 90 days
```

### 4. Accessibility Requirements
```yaml
standard: WCAG 2.1 Level AA
requirements:
  - Keyboard navigation for all features
  - Screen reader compatibility  
  - Color contrast ratio ≥ 4.5:1
  - Focus indicators visible
  - Alt text for all images
  - ARIA labels where needed
  - Skip navigation links
  - Responsive design (mobile-first)
```

### 5. Internationalization Requirements
```yaml
supported_locales: ["en-GB"]  # The Anchor is UK only
requirements:
  - No hardcoded user-facing strings
  - Date/time formatting per UK locale
  - Number formatting per UK locale
  - Character encoding: UTF-8
```

---

## 🔐 AI-Specific Safety & Governance

### Prompt Injection Defense
```python
# NEVER do this:
user_input = get_user_input()
exec(ai_model.generate(f"Write code to {user_input}"))

# ALWAYS do this:
user_input = sanitize(get_user_input())
code = ai_model.generate(prompt)
human_review = require_approval(code)
if human_review.approved:
    execute_sandboxed(code)
```

### Data Governance Matrix
| Data Class | Can Log? | Can Store? | Can Transmit? | Retention |
|------------|----------|------------|---------------|-----------|
| Public | ✅ Yes | ✅ Yes | ✅ Yes | Indefinite |
| Internal | ✅ Yes | ✅ Yes | ⚠️ Internal only | 2 years |
| Confidential | ⚠️ Masked | ✅ Encrypted | ⚠️ Encrypted | 1 year |
| PII | ❌ No | ⚠️ Encrypted | ⚠️ With consent | 90 days |

### LLM Evaluation Protocol
**For every new AI-integrated feature:**

```yaml
correctness_tests:
  count: 5
  cases:
    - input: [typical case]
      expected: [correct output]
    - input: [edge case]  
      expected: [correct handling]

security_tests:
  jailbreak_probes: 3
  prompt_injection_probes: 3
  data_leak_probes: 3
  
performance_tests:
  latency_p95: < 2s
  token_usage: < 1000 per request
  cost_per_request: < $0.01
```

### Cost Control Guardrails
```yaml
per_task_limits:
  max_tokens: 10000
  max_cost: $1.00
  timeout: 60s
  
per_day_limits:
  max_tokens: 1000000
  max_cost: $50.00
  
abort_conditions:
  - usage > 120% of limit
  - repeated_errors > 3
  - infinite_loop_detected
```

---

## 📡 Observability Blueprint

### Structured Logging Standard
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO|WARN|ERROR|DEBUG",
  "service": "the-anchor.pub",
  "trace_id": "uuid-v4",
  "span_id": "uuid-v4",
  "user_id_hash": "sha256(user_id)",
  "event": "descriptive.event.name",
  "data_class": "public|internal|confidential|pii",
  "duration_ms": 123,
  "error": null,
  "metadata": {}
}
```

### Four Golden Signals
```yaml
latency:
  metric: response_time_ms
  dimensions: [endpoint, method, status_code]
  
traffic:
  metric: requests_per_second
  dimensions: [endpoint, method, user_type]
  
errors:
  metric: error_rate
  dimensions: [endpoint, error_type, severity]
  
saturation:
  metric: resource_utilization_percent
  dimensions: [cpu, memory, disk, network]
```

### Trace Boundaries
```
START span: "http.request"
  ├── span: "auth.check"
  ├── span: "db.query"
  │   ├── span: "connection.acquire"
  │   └── span: "query.execute"
  ├── span: "external.api.call"
  │   └── span: "http.client.request"
  └── span: "response.serialize"
END span: "http.request"
```

### Health Check Endpoints
```yaml
/api/health:  # Liveness - is service running?
  response: {"status": "ok"}
  checks: []

/api/ready:   # Readiness - can service handle traffic?
  response: {"status": "ok", "checks": {...}}
  checks:
    - external API connectivity (management.orangejelly.co.uk)
    - disk space > 10%
    - memory usage < 90%
```

---

## 💪 Resilience Patterns

### 1. Retry with Exponential Backoff
```
retry_with_backoff(operation, max_attempts=3):
  base_delay = 100ms
  max_delay = 10s
  jitter = ±25%
  
  for attempt in 1..max_attempts:
    try:
      return operation()
    catch (e):
      if not_retryable(e): throw e
      if attempt == max_attempts: throw e
      
      delay = min(base_delay * (2^attempt), max_delay)
      delay = delay * random(0.75, 1.25)  # jitter
      sleep(delay)
```

### 2. Circuit Breaker
```
circuit_breaker:
  failure_threshold: 5 errors in 60s
  success_threshold: 2 successes to close
  timeout: 30s
  half_open_checks: 1 request
  
  states:
    CLOSED → normal operation
    OPEN → fail fast, no calls
    HALF_OPEN → limited test traffic
```

### 3. Bulkhead Pattern
```
resource_pools:
  database_pool:
    min: 5
    max: 20
    timeout: 5s
    
  http_client_pool:
    min: 10
    max: 50
    timeout: 10s
    
  worker_pool:
    min: 2
    max: 10
    queue_size: 100
```

### 4. Timeout Pattern
```yaml
timeouts:
  http_request: 10s
  database_query: 5s
  cache_operation: 1s
  file_io: 30s
  total_request: 30s
  external_api_call: 15s  # management.orangejelly.co.uk
```

### 5. Graceful Degradation
```
when service_unavailable:
  primary: fetch_from_api()
  fallback_1: fetch_from_cache()
  fallback_2: return_default_value()
  fallback_3: return_error_with_retry_after
```

---

## 🧪 Test Strategy & Data Management

### Test Pyramid Distribution
```
       /\        5% - E2E Tests (Critical user journeys)
      /  \
     /    \     15% - Integration Tests (API, DB)
    /      \
   /        \   30% - Component Tests (Modules)
  /          \
 /____________\ 50% - Unit Tests (Functions, Classes)
```

### Test Data Management Rules
```yaml
forbidden:
  - Real production data in tests
  - Actual PII in fixtures
  - Hardcoded test credentials
  - Non-deterministic test data

required:
  - Synthetic data generation
  - Deterministic seeds
  - Isolated test databases
  - Rollback after each test
```

### Golden Test Values
```yaml
# Deterministic values for reproducibility
test_ids:
  user: "test-user-123"
  admin: "test-admin-456"
  tenant: "test-tenant-789"

test_timestamps:
  created: "2024-01-01T00:00:00Z"
  updated: "2024-01-01T12:00:00Z"
  deleted: "2024-01-01T23:59:59Z"

test_amounts:
  small: 1.00
  medium: 100.00
  large: 10000.00
```

### Synthetic Data Generation
```bash
# Seed command for The Anchor
npm run seed       # Node/Next.js
```

---

## 🚀 Release Management & Rollback

### Release Gate Checklist
```yaml
pre_release_gates:
  - [ ] All tests passing
  - [ ] Security scan clean
  - [ ] Performance benchmarks met
  - [ ] Documentation updated
  - [ ] Migration scripts tested
  - [ ] Rollback plan documented
  - [ ] Monitoring alerts configured
  - [ ] Feature flags configured (if applicable)

smoke_tests:
  - [ ] Service starts successfully
  - [ ] Health check responds 200
  - [ ] Core API endpoints work
  - [ ] External API integration works (management.orangejelly.co.uk)
  - [ ] GTM tracking functional
```

### Rollback Playbook
```bash
# 1. Detect issue
alert: "Error rate > 5% for 2 minutes"

# 2. Assess impact
check: logs, metrics, traces

# 3. Decision point (< 2 min)
IF user_impact > threshold:
  execute: rollback
ELSE:
  execute: hotfix

# 4. Rollback procedure
rollback_steps:
  1. Revert to previous Vercel deployment
  2. Verify health checks pass
  3. Confirm error rate drops
  4. Document incident
  5. Root cause analysis

# 5. The Anchor specific rollback
vercel rollback  # Vercel CLI
```

### Feature Flag Implementation
```yaml
feature_flags:
  naming: "feature_[name]_enabled"
  default: false  # Always default to OFF
  
  rollout_stages:
    1. Internal testing: 1%
    2. Beta users: 10%  
    3. Canary: 25%
    4. General availability: 100%
    
  kill_switch:
    endpoint: POST /api/flags/{flag}/disable
    effect: immediate
    scope: global
```

---

## 📝 Architecture Decision Records (ADR)

### ADR Template (15-minute limit)
```markdown
# ADR-[YYYY-MM-DD]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[1-2 sentences on why this decision is needed]

## Problem
[What specific problem are we solving?]

## Options Considered
1. **Option A**: [Brief description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

2. **Option B**: [Brief description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

3. **Option C**: [Brief description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

## Decision
[Which option and why - 1-2 sentences]

## Consequences
- Positive: [What improves]
- Negative: [What trade-offs]
- Risks: [What could go wrong]

## Test Strategy
[How we'll validate this works]

## Rollback Plan
[How to undo if needed]
```

### When to Write an ADR
- Choosing between technologies/frameworks
- Changing architectural patterns
- Making security trade-offs
- Adopting new development practices
- Breaking changes to APIs

---

## 🔌 API Contracts & Stability

### API Versioning Strategy
```yaml
versioning:
  strategy: URL  # /api/v1/, /api/v2/
  format: "v[MAJOR]"
  
  compatibility:
    breaking_changes: New major version
    new_features: Same version, additive only
    bug_fixes: Same version, no changes
    deprecation: 6 months notice minimum
```

### API Contract Template
```yaml
endpoint: /api/v1/resource
method: POST
auth: Bearer token required

request:
  headers:
    Content-Type: application/json
    X-Request-ID: uuid (required)
    X-Idempotency-Key: string (required for mutations)
    
  body:
    type: object
    required: [field1, field2]
    properties:
      field1: string, max 255
      field2: number, > 0
      field3: enum [a, b, c] (optional)

response:
  success:
    status: 201
    body:
      id: string
      created_at: ISO8601
      data: object
      
  errors:
    400: Validation error
    401: Unauthorized
    403: Forbidden
    404: Not found
    409: Conflict (duplicate)
    429: Rate limited
    500: Internal error
    503: Service unavailable
```

### Backward Compatibility Rules
```yaml
allowed:
  - Adding optional fields
  - Adding new endpoints
  - Adding new optional headers
  - Expanding enums (append only)
  
forbidden:
  - Removing fields
  - Changing field types
  - Renaming fields
  - Changing required/optional
  - Removing enum values
  - Changing error codes
```

---

## 📋 PR/Change Templates

### Pull Request Template
```markdown
## What Changed
[1-2 sentences describing the change]

## Why
[Link to issue/ticket and brief context]

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation only
- [ ] Performance improvement
- [ ] Refactoring

## Assumptions Made
- [List any assumptions that influenced implementation]
- [Document decisions not evident in code]

## Risk Assessment
**Risk Level**: [Low | Medium | High]
**Potential Impact**: [What could go wrong]
**Rollback Plan**: [How to undo]

## Testing Evidence
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance impact measured

### Test Results
```
[Paste test output or screenshot]
```

## Quality Gates Status
- [ ] Build passes: ✅
- [ ] Tests pass: ✅  
- [ ] Coverage > 80%: ✅
- [ ] No security issues: ✅
- [ ] Performance acceptable: ✅
- [ ] Documentation updated: ✅

## Deployment Notes
[Any special deployment steps or considerations]
```

### Commit Message Format
```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
perf: Performance improvement
refactor: Code refactoring
test: Test additions/changes
docs: Documentation only
chore: Maintenance tasks
security: Security improvements

# Example:
feat(booking): add OAuth2 support for Google login

- Implemented OAuth2 flow
- Added token refresh logic
- Updated user model for OAuth data

Assumptions:
- Users can link multiple OAuth providers
- Tokens stored encrypted in database

Risk: Medium - new auth flow
Rollback: Feature flag OAUTH_ENABLED=false

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔄 Verification Pipeline

### Universal Pipeline Order
```yaml
pipeline:
  1_lint:
    command: npm run lint
    fail_fast: true
    
  2_typecheck:
    command: npx tsc --noEmit
    fail_fast: true
    
  3_security:
    command: "scan for secrets, check dependencies"
    fail_fast: true
    
  4_unit_tests:
    command: npm test
    fail_fast: true
    coverage_threshold: 80
    
  5_integration_tests:
    command: "npm run test:integration"
    fail_fast: false
    
  6_build:
    command: npm run build
    fail_fast: true
    
  7_performance:
    command: "benchmark against baseline"
    fail_threshold: "20% regression"
    
  8_smoke:
    command: "start service, check health"
    timeout: 30s
```

### Quality Gate Enforcement
```yaml
quality_gates:
  mandatory:  # Must pass to proceed
    - lint_errors == 0
    - type_errors == 0
    - test_failures == 0
    - build_success == true
    - security_vulnerabilities.critical == 0
    
  warnings:  # Log but don't block
    - coverage < 80
    - complexity > 10
    - duplicaton > 5
    
  metrics:  # Track trends
    - bundle_size
    - test_duration  
    - build_duration
    - dependency_count
```

---

## 🌐 Context Window Management

### Optimal Context Loading Strategy
```yaml
context_priority:
  1_critical:  # Always include
    - Current task description
    - Error messages/stack traces
    - Direct dependencies
    
  2_important:  # Include if space
    - Related code modules
    - Recent git history
    - Test files
    
  3_helpful:  # Include if ample space
    - Documentation
    - Similar examples
    - Historical context
    
  4_optional:  # Only if requested
    - Full codebase structure
    - External documentation
    - Performance metrics
```

### Context Reduction Techniques
```python
# Instead of full file contents:
def summarize_file(filepath):
  return {
    "path": filepath,
    "exports": [...],  # Public API only
    "imports": [...],  # Dependencies
    "line_count": 150,
    "complexity": "medium"
  }

# Instead of full history:
def recent_changes(file, max_commits=5):
  return last_n_commits_touching(file)
```

---

## 📊 Feedback Loop & Continuous Learning

### AI Interaction Metrics
```yaml
tracking:
  task_id: uuid
  timestamp: ISO8601
  model: "Claude-3.5|GPT-4|etc"
  complexity_score: 1-100
  
  input:
    prompt_tokens: count
    context_size: bytes
    
  output:
    completion_tokens: count
    time_to_first_token: ms
    total_duration: ms
    
  quality:
    worked_first_try: boolean
    modifications_needed: count
    human_time_saved: minutes
    
  cost:
    estimated: USD
    actual: USD
```

### Learning Database Schema
```sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  task_type VARCHAR(50),
  success_rate DECIMAL(3,2),
  avg_iterations DECIMAL(3,1),
  common_failures JSON,
  best_practices JSON,
  updated_at TIMESTAMP
);

-- Query for improvement insights
SELECT task_type, 
       AVG(success_rate) as avg_success,
       JSON_AGG(best_practices) as patterns
FROM ai_interactions
WHERE updated_at > NOW() - INTERVAL '30 days'
GROUP BY task_type
ORDER BY avg_success DESC;
```

---

## 🚦 Quick Reference Card

### Before Starting ANY Task
```bash
1. Load Project Profile (top of this doc)
2. Check Definition of Ready
3. Assess complexity score
4. Review relevant patterns
5. Create checkpoint: git commit -m "checkpoint: before [task]"
```

### During Development Loop
```bash
while not_done:
  1. Make 1-3 atomic changes
  2. Run: npm run lint
  3. Run: npx tsc --noEmit
  4. Run: npm test
  5. If all pass: git commit -m "checkpoint: [description]"
  6. If > 1 hour: document progress
```

### Before Marking Complete
```bash
1. Run full verification pipeline
2. Check all quality gates
3. Update documentation
4. Create PR with template
5. Verify rollback plan exists
```

### If Something Goes Wrong
```bash
1. Stop immediately
2. Check git status
3. Identify last working commit
4. Rollback: git reset --hard [commit]
5. Document what failed
6. Try smaller incremental approach
```

---

## 🏪 The Anchor Specific Guidelines

### Critical Business Rules

#### Brand Standards
- **Always use**: "The Anchor" (never "The Anchor Pub" in content)
- **Contact**: info@theanchorpub.co.uk | 01753 682707
- **Domain**: www.the-anchor.pub (canonical with www)
- **Location**: Stanwell Moor, near Heathrow Airport

#### Content Verification
**Single Source of Truth Files:**
- `/docs/copy-assumptions.md` - Verified operational claims that appear in copy
- `/docs/api-integration.md` - Core management API usage
- `/docs/parking-api.md` - Parking subsystem contract
- `/docs/google-places.md` - Legacy Google Places / reviews notes (integration removed)

#### Business Logic Rules
1. **Monday Kitchen**: Always closed unless special hours explicitly open it
2. **Sunday Lunch**: Requires advance booking and prepayment
3. **Opening Hours**: Verified as of January 2025
4. **No Service**: No breakfast, delivery, Sky Sports, or guest ales
5. **Special Events**: Drag shows, karaoke, quiz nights

#### API Integration Rules
- **Single Source**: Management API (management.orangejelly.co.uk) is source of truth
- **Phone Format**: Normalize to E.164 (+44...)
- **Idempotency**: Use keys for bookings to prevent duplicates
- **Error Handling**: Always provide fallback for API failures
- **Authentication**: Use ANCHOR_API_KEY environment variable

### SEO & Domain Configuration

#### CRITICAL: Canonical Domain Setup
**The site uses www.the-anchor.pub as the canonical domain**

#### Domain & DNS Configuration
- **DNS**: Managed by Cloudflare
- **Hosting**: Vercel
- **Canonical Domain**: `https://www.the-anchor.pub` (with www)
- **SSL/TLS**: Cloudflare MUST be set to "Full" or "Full (strict)" (NOT "Flexible")

#### Canonical URL Implementation
**DO NOT hardcode canonical URLs in layout.tsx!** This was a critical bug that made all pages claim to be the homepage.

Correct implementation:
```typescript
// app/layout.tsx - Set metadataBase only
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  // DO NOT add alternates.canonical here!
}

// Individual pages - Use relative canonical
export const metadata: Metadata = {
  alternates: {
    canonical: './', // Uses metadataBase + current path
  },
}
```

#### Common SEO Mistakes to Avoid
1. **Never hardcode canonical in root layout** - It makes ALL pages have the same canonical
2. **Always use www.the-anchor.pub** - The site is configured for www, not non-www
3. **Check for redirect loops** - Ensure no circular redirects in blog-redirects.json
4. **Verify imports** - Always check components are properly imported before using
5. **Keep domain consistent** - All references should use www version

#### Sitemap & Robots.txt
- Sitemap URLs must use the canonical domain (www)
- Update robots.txt to reference www URLs
- Remove duplicate entries from sitemap.ts

#### When Adding New Pages
1. Use relative canonical URLs (e.g., `canonical: '/new-page'`)
2. Ensure the page is added to sitemap.ts
3. Check that all internal links use relative paths
4. Verify no redirect conflicts

#### Cloudflare Settings
**CRITICAL**: If you see "ERR_TOO_MANY_REDIRECTS":
1. Check Cloudflare SSL/TLS is set to "Full" or "Full (strict)"
2. Disable any Cloudflare Page Rules that might cause redirects
3. Let Vercel handle www/non-www redirects, not Cloudflare

#### Testing Canonical Implementation
```bash
# Check canonical tag on any page
curl -s https://www.the-anchor.pub/[page] | grep '<link rel="canonical"'

# Verify only ONE canonical tag exists
# Verify it points to the correct URL (not homepage)
```

### Common Tasks & Patterns

#### Adding a New Page
```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero/HeroWrapper'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: {
    canonical: './', // Relative to metadataBase
  },
}

export default function Page() {
  return (
    <>
      <HeroWrapper
        route="/new-route"
        title="Page Title"
        description="Description"
      />
      {/* Page content */}
    </>
  )
}
```

#### Adding Analytics Tracking
```typescript
'use client'  // Required for tracking
import { trackEventName } from '@/lib/gtm-events'

// In component
<Button onClick={() => trackEventName('source_location')}>
  Action
</Button>
```

#### Updating Business Information
1. Update `/docs/copy-assumptions.md`
2. Update `/lib/constants.ts` if needed
3. Search for hardcoded instances
4. Test build for TypeScript errors

#### API Error Handling Pattern
```typescript
try {
  const response = await fetch('/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${process.env.ANCHOR_API_KEY}`
    }
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  const data = await response.json()
  return data
} catch (error) {
  console.error('API call failed:', error)
  // Return fallback data or handle gracefully
  return defaultData
}
```

### Project Architecture

#### Directory Structure
```
the-anchor.pub/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (proxy pattern)
│   ├── book-table/        # Booking flow
│   └── [route]/page.tsx   # Route pages
├── components/
│   ├── ui/                # Reusable UI primitives
│   │   ├── primitives/    # Button, Input, Badge
│   │   ├── layout/        # Container, Section, Grid
│   │   └── index.ts       # Central exports
│   ├── features/          # Business components
│   └── tracking/          # Analytics components
├── lib/                   # Utilities and helpers
│   ├── api/              # API client code
│   ├── gtm-events.ts     # Analytics tracking
│   ├── constants.ts      # Business constants
│   └── hours-utils.ts    # Business hours logic
├── public/               # Static assets
├── docs/                 # Documentation
│   ├── README.md
│   ├── api-integration.md
│   ├── copy-assumptions.md
│   ├── deployment.md
│   ├── domain-migration-safe-email.md
│   ├── domain-migration.md
│   ├── image-optimization.md
│   ├── parking-api.md
│   ├── google-places.md
│   └── style-guide.md
└── tests/               # Test files
```

#### Key Architecture Patterns

##### 1. Server-First Approach
- Default to React Server Components
- Add `'use client'` only for interactivity (onClick, useState)
- Server components fetch data directly

##### 2. API Proxy Pattern
All external API calls go through Next.js API routes:
- Protects API keys (environment variables)
- Handles CORS issues
- Adds caching and error handling
- Centralizes API logic

##### 3. Unified Business Logic
- Single source of truth for hours/kitchen status
- Centralized in `/lib/hours-utils.ts`
- Consistent handling across all endpoints

### React/Next.js Patterns

#### Server Components (default)
```typescript
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

#### Client Components (only when needed)
```typescript
'use client'
import { useState } from 'react';
export function InteractiveComponent() {}
```

#### Always use forwardRef for UI components
```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {}
);
```

### CVA Pattern for Components
```typescript
const componentVariants = cva('base-classes', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})
```

### Performance Optimization

#### Image Handling
```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={aboveFold}
/>
```

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <Skeleton /> }
)
```

#### Bundle Optimization
- Use dynamic imports for non-critical components
- Implement route-based code splitting
- Minimize client-side JavaScript
- Prefer server components

### API Documentation Reference

Whenever making changes to API usage, consult:
- `/docs/api-integration.md`
- `/docs/parking-api.md`
- `/docs/google-places.md` (legacy; integration removed)

---

## 📜 Universal Principles Summary

### The 10 Commandments of AI-Assisted Development
1. **Thou shalt make no change without understanding context**
2. **Thou shalt not commit secrets or PII**
3. **Thou shalt test every change before proceeding**
4. **Thou shalt document every assumption**
5. **Thou shalt prefer small increments over big bangs**
6. **Thou shalt respect existing patterns**
7. **Thou shalt handle errors gracefully**
8. **Thou shalt measure before optimizing**
9. **Thou shalt make rollback possible**
10. **Thou shalt stop when uncertain and ask**

---

**Version**: 4.0.0 (The Anchor Customized)
**Last Updated**: 2025-01-25
**Status**: Production Ready
**License**: MIT  

**Remember**: This is a living document. Update based on learnings. Quality > Speed. Safety > Features.

---

# Appendix: Node.js/Next.js Specific Additions

## Node.js/JavaScript Specific
```yaml
tools:
  package_manager: npm
  runtime: node
  test_runner: jest|vitest
  bundler: webpack (Next.js internal)
  
common_patterns:
  - Next.js App Router for pages
  - React Server Components by default
  - Tailwind CSS for styling
  - CVA for component variants
  - Prisma/TypeORM for database (if needed)
  - Google Tag Manager for analytics
```

---

*End of Document*
