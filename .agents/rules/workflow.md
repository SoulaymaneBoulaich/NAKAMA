---
trigger: always_on
---

Code must pass through these gates sequentially:
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
RULE: No gate can be skipped. Failure at any gate sends code back to development.