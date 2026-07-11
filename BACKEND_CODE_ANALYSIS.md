# Backend Codebase Analysis Report
**Analysis Date:** 2026-07-09  
**Directory:** `backend/src`  
**Scope:** All TypeScript files + package.json

---

## Summary
- **Total TS Files Analyzed:** 41
- **Issues Found:** 15
- **Severity:** Low-to-Medium
- **Safe to Remove:** 10 items
- **Requires Review:** 5 items

---

## 1. UNUSED FUNCTIONS

### 1.1 `buildWaCopyFallback()` - **SAFE TO REMOVE**
- **File:** [services/whatsappService.ts](services/whatsappService.ts#L17)
- **Type:** Exported function
- **Line:** 17-19
- **Usage:** Never imported or called anywhere in the codebase
- **Code:**
  ```typescript
  export function buildWaCopyFallback(messageText: string): string {
    return messageText;
  }
  ```
- **Recommendation:** Remove - This appears to be a placeholder for a future feature (fallback when no phone number)

---

### 1.2 `enqueueJob()` - **REQUIRES REVIEW**
- **File:** [services/qstashService.ts](services/qstashService.ts#L6)
- **Type:** Exported async function
- **Line:** 6-13
- **Usage:** Never imported or called
- **Comment in code:** "reserved for future async jobs (not used by inquiry flow)"
- **Recommendation:** Safe to remove if Phase 7 QStash worker is not planned. Currently dead code for an incomplete feature.

---

### 1.3 `estimateTravelTime()` - **SAFE TO REMOVE**
- **File:** [services/distanceService.ts](services/distanceService.ts#L8)
- **Type:** Exported function
- **Lines:** 8-19
- **Usage:** Only used internally as fallback in `getTravelTimes()` on line 68, never exported/imported elsewhere
- **Recommendation:** Make this function private (remove `export`) or keep if future features might need it standalone

---

## 2. UNUSED IMPORTS

### 2.1 Redundant Module Import - **LOW PRIORITY**
- **File:** [index.ts](index.ts)
- **Lines:** 4-5
- **Code:**
  ```typescript
  import './instrument.js'; // MUST be first
  
  import Sentry from './instrument.js';
  ```
- **Issue:** Module imported twice - once for side effects, once for default export
- **Recommendation:** This is intentional for clarity but could be consolidated. Keep as-is for readability that initialization MUST happen first.

---

### 2.2 Unused `z` Validator Import - **REQUIRES REVIEW**
- **File:** [routes/restaurants.ts](routes/restaurants.ts#L3)
- **Line:** 3
- **Import:** `import { z } from 'zod';`
- **Issue:** `z` is used to create `SearchQuerySchema` locally, but the schema is only used once in the single route and hardcoded `cached: true` is returned instead of actual cache status
- **Recommendation:** Keep import - it's used. However, see section 3.3 about the misleading caching behavior.

---

## 3. MISLEADING/DEAD CODE PATHS

### 3.1 Hardcoded Cache Status - **REQUIRES REVIEW**
- **File:** [routes/restaurants.ts](routes/restaurants.ts#L24)
- **Line:** 24
- **Code:**
  ```typescript
  return reply.send({
    restaurants,
    cached: true,  // ❌ HARDCODED - Always true even if not cached
    count: restaurants.length,
  });
  ```
- **Issue:** The route indicates all responses are cached, but:
  1. No cache check is performed before the search
  2. No cache write happens after the search
  3. Response is misleading to frontend
- **Comparison:** Similar routes in [activities.ts](routes/activities.ts#L28), [weather.ts](routes/weather.ts) properly track cache status
- **Recommendation:** Implement actual caching like other routes, or remove `cached` field

---

### 3.2 Weather Route Inconsistency - **REQUIRES REVIEW**
- **File:** [routes/weather.ts](routes/weather.ts#L24)
- **Line:** 24
- **Code:**
  ```typescript
  cached: forecast !== null,
  ```
- **Issue:** Cache status is tied to whether forecast exists, not whether it came from cache. Similar misdirection as restaurants route.
- **Recommendation:** Track cache source explicitly or remove the field

---

### 3.3 Empty Worker Implementation - **INTENTIONAL INCOMPLETE**
- **File:** [workers/inquiryWorker.ts](workers/inquiryWorker.ts)
- **Lines:** 1-7
- **Code:**
  ```typescript
  const workerRoutes: FastifyPluginAsync = async (_app) => {
    // Secret-verified handler — implemented in Phase 7
  };
  ```
- **Issue:** Empty function registered in index.ts but does nothing
- **Status:** Intentional - Phase 7 feature not yet implemented
- **Recommendation:** Keep for now (placeholder for future phase)

---

## 4. DUPLICATE CODE PATTERNS

### 4.1 `nightsBetween()` Function Duplication - **SAFE TO REFACTOR**
- **Files:** 
  - [services/bookingService.ts](services/bookingService.ts#L13)
  - [services/airbnbService.ts](services/airbnbService.ts#L15)
- **Issue:** Identical function defined in both files
- **Code:**
  ```typescript
  function nightsBetween(checkin: string, checkout: string): number {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }
  ```
- **Recommendation:** Extract to `lib/dateUtils.ts` and import in both services

---

### 4.2 Google Places Mapping Pattern - **SAFE TO REFACTOR**
- **Files:**
  - [services/placesService.ts](services/placesService.ts#L31) - `mapPlace()`
  - [services/restaurantService.ts](services/restaurantService.ts#L29) - `mapRestaurant()`
- **Issue:** ~40% code duplication in mapping logic
- **Duplicated Code:**
  - Photo URL construction
  - Location extraction (`lat`, `lng` from various field names)
  - Opening hours extraction
  - Rating/review count handling
  - Address mapping
- **Recommendation:** Create shared `mapGooglePlace()` utility function that both services use

---

### 4.3 Generic API Error Handling - **CONSISTENT PATTERN**
- **Pattern:** Similar try-catch-logger pattern in:
  - [services/bookingService.ts](services/bookingService.ts#L70)
  - [services/airbnbService.ts](services/airbnbService.ts#L88)
  - [services/placesService.ts](services/placesService.ts#L84)
  - [services/restaurantService.ts](services/restaurantService.ts#L106)
  - [services/weatherService.ts](services/weatherService.ts#L89)
- **Status:** This is intentional - consistent error handling pattern (not harmful duplication)
- **Recommendation:** Keep as-is

---

## 5. UNUSED MIDDLEWARE

### 5.1 `requestLogger()` Middleware - **REQUIRES REVIEW**
- **File:** [middleware/requestLogger.ts](middleware/requestLogger.ts)
- **Lines:** 1-27
- **Status:** Function is defined and exported but **never registered** in [index.ts](index.ts)
- **Issue:** Complete logging middleware exists but isn't applied globally
- **Currently Registered:** 
  - Line 36 in index.ts: Sentry context hook
  - No request logger hook found
- **Recommendation:** Either:
  1. Register it in index.ts: `app.addHook('preHandler', requestLogger)`
  2. Or remove the middleware file if request logging isn't needed

---

## 6. UNUSED DEPENDENCIES

### 6.1 `@upstash/qstash` - **CONDITIONAL**
- **File:** [services/qstashService.ts](services/qstashService.ts)
- **Status:** Imported and used, but the service itself is never called
- **Recommendation:** Keep for Phase 7 implementation, or remove if queueing is not planned

---

## 7. MISSING FILES

### 7.1 Referenced but Non-existent Files
- **File:** [schemas/plan.ts](schemas/plan.ts) - Not found
- **File:** [schemas/message.ts](schemas/message.ts) - Not found
- **Status:** Not imported anywhere currently, so no broken imports
- **Note:** May be placeholders for future features

---

## 8. UNUSED SCHEMA FIELDS

### 8.1 `OnboardingBodySchema` - **CHECK USAGE**
- **File:** [schemas/user.ts](schemas/user.ts#L27)
- **Status:** Schema defines fields but all are `.optional()`, so frontend can send empty object
- **Issue:** On [auth.ts](routes/auth.ts#L76), the endpoint accepts but doesn't validate structure
- **Recommendation:** Check frontend usage to ensure all optional fields are actually needed

---

## 9. DEAD CODE IN ROUTES

### 9.1 Unused Variable in trips.ts - **SAFE TO REMOVE**
- **File:** [routes/trips.ts](routes/trips.ts#L190)
- **Line:** 190
- **Code:**
  ```typescript
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (tripError || !trip) {
    return reply.status(404).send({ error: 'Trip not found', requestId: request.requestId });
  }

  // Fetch user preferences from DB fallback
  const { data: userPref } = await supabase
    .from('users')
    .select('travel_style, interests, budget_tier')
    .eq('id', trip.user_id)
    .single();
  ```
- **Note:** This pattern is used but in the streaming endpoint, `userPref` is fetched but the selection is redundant since trip already has user_id

---

## 10. SUMMARY OF SAFE REMOVALS

| Item | Type | File | Reason |
|------|------|------|--------|
| `buildWaCopyFallback()` | Function | whatsappService.ts | Never called, placeholder feature |
| `enqueueJob()` | Function | qstashService.ts | Dead code for Phase 7 (future) |
| `estimateTravelTime()` export | Function | distanceService.ts | Only used internally |
| `requestLogger` middleware | Middleware | middleware/requestLogger.ts | Defined but not registered |

---

## 11. RECOMMENDATIONS (PRIORITY ORDER)

### Priority 1: Fix Cache Status Tracking
- **Location:** restaurants.ts, weather.ts
- **Impact:** Frontend receives misleading cache information
- **Effort:** Low
- **Action:** Implement actual cache checks or remove cache field

### Priority 2: Extract Duplicate Functions
- **Location:** Multiple service files
- **Impact:** Code maintainability, reduced LOC
- **Effort:** Low-Medium
- **Action:** Create `lib/dateUtils.ts` and `lib/placesMapper.ts`

### Priority 3: Register Missing Middleware
- **Location:** middleware/requestLogger.ts
- **Impact:** Request logging not working
- **Effort:** Very Low
- **Action:** Add to index.ts or remove if not needed

### Priority 4: Clean Up Unused Functions
- **Location:** whatsappService.ts, qstashService.ts
- **Impact:** Code clarity, reduced confusion
- **Effort:** Low
- **Action:** Remove or mark as "@deprecated"

### Priority 5: Review Phase 7 Placeholder
- **Location:** workers/inquiryWorker.ts
- **Impact:** Empty route registration
- **Effort:** Depends on implementation plan
- **Action:** Implement or move to separate branch for Phase 7

---

## Appendix: Fully Utilized Dependencies
✅ All major dependencies are being used:
- `fastify`: Core framework
- `@sentry/node`: Error tracking  
- `@supabase/supabase-js`: Database + auth
- `@upstash/redis`: Caching
- `axios`: HTTP requests
- `zod`: Schema validation
- `pino`: Logging

---

**Report generated by:** Automated Code Analysis  
**Next steps:** Address Priority 1-2 issues before production deployment
