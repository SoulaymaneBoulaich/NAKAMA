---
name: prisma-optimizer
description: >
  Handles Prisma query optimization and performance auditing for Nakama's database layer. 
  Use when the user mentions slow queries, N+1 problems, Prisma include performance, 
  or database optimization. Trigger when the user says "why is this query slow", 
  "optimize Prisma", or "detect N+1". Do NOT trigger for basic Prisma schema 
  definitions or frontend React Query logic.
---

# Nakama Prisma Optimizer

Expert performance advisor for Prisma 6. This skill specializes in identifying inefficient data fetching patterns, particularly in Nakama's complex anime-to-user and social relationships.

---

## Phase 1: N+1 Detection & Remediation

**Entry:** Reviewing `findMany` or `findFirst` calls, especially inside loops or high-frequency endpoints.

1. **Loop Check**: Ensure `prisma.model.findUnique` or similar is NOT being called inside a `.map()` or `.forEach()`.
2. **Batching**: If multiple related records are needed, use `include` or `select` to fetch them in a single database round-trip.
3. **Fluent API Audit**: Check if the Prisma Fluent API (e.g., `prisma.user.findUnique(...).posts()`) is being used in a way that triggers multiple queries; replace with a single `findUnique` + `include`.

**Exit:** All iterative database calls are refactored into batched queries.

---

## Phase 2: Payload & Select Optimization

**Entry:** Query results are returning too much data or are slow to serialize.

1. **Select vs Include**: Prefer `select` over `include` to fetch only the specific fields required. Avoid fetching large `bio` or `description` fields unless needed.
2. **Pagination**: Verify that `take` and `skip` (or cursor-based pagination) are applied to any list-returning endpoint to prevent "fetch-all" performance degradation.
3. **Relation Depth**: If relationships are nested deeper than 3 levels (e.g., User -> Post -> Comment -> Author), recommend splitting into multiple queries to avoid massive, slow joins.

**Exit:** Payload size is minimized and pagination is enforced.

---

## Phase 3: Schema & Index Audit

**Entry:** A specific query is slow even with optimized select/include.

1. **Index Check**: Refer to `server/prisma/schema.prisma` and verify that fields used in `where` or `orderBy` clauses (e.g., `slug`, `email`, `createdAt`) have the `@unique` or `@@index` attribute.
2. **Full-Text Search**: If searching for anime titles, ensure Nakama is using Prisma's full-text search features or a specialized index rather than `contains` on an unindexed field.
3. **Count Optimization**: For social features (e.g., follower counts), ensure `_count` is used instead of fetching all related records and checking `.length`.

**Exit:** Database schema recommendations are delivered based on query patterns.

---

## Common Traps

| Trap | Correct Behavior |
|---|---|
| Deeply nested `include` | Use `select` to target only the IDs and names needed for the UI. |
| Fetching full records for counts | Use Prisma's `_count` aggregate to perform the count in the database. |
| Missing indexes on FKs | Ensure all foreign keys used in relations have explicit indexes for join performance. |
| Querying without `take` | Always apply a default limit (e.g., `take: 20`) to prevent crashing on large datasets. |

---

## Eval Cases (evals.json)

```json
[
  {
    "query": "My anime list page is loading very slowly. Can you check my Prisma query?",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Direct request for performance help with a Prisma query."
  },
  {
    "query": "How do I add a new field to my User model in Prisma?",
    "should_trigger": false,
    "label": "true_negative",
    "notes": "This is a schema definition task, not an optimization task."
  },
  {
    "query": "Is there an N+1 problem in this code: users.map(u => prisma.post.findMany({ where: { userId: u.id } }))",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Classic N+1 detection request."
  },
  {
    "query": "I want to optimize the database.",
    "should_trigger": true,
    "label": "edge_case",
    "notes": "Vague but involves the target domain. Should load to guide the user."
  }
]
```
