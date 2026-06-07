# Retreat — Implementation Additions
### Missing Functionality vs Functionality Spec

---

## HOW TO USE THIS DOCUMENT

This document is a **supplement** to `implementation.md`. It covers everything in the
functionality spec that is not yet in the existing implementation plan.

Read both documents together. Build existing phases first (Phases 0–12), then build
these additions in order.

Same rules apply:
- `[YOU]` — human does this manually
- `[AI]` — antigravity builds this completely
- Never invent env variable names — all new vars are listed in the ENV ADDITIONS section
- Never skip a phase — complete each in order
- All new Zod schemas must be validated before use

---

## GAP ANALYSIS — WHAT IS MISSING

| Functionality Spec Item | Status in current impl.md | Action |
|---|---|---|
| Restaurant search (Google Places) | ❌ Missing | Add Phase A |
| Weather per day (OpenWeatherMap) | ❌ Missing | Add Phase B |
| Travel time between activities (Distance Matrix) | ❌ Missing | Add Phase C |
| Geographic clustering of activities | ❌ Missing | Add Phase C |
| User preferences fed into AI (travel_style, interests, budget) | ❌ Missing | Add Phase D |
| Restaurants in AI itinerary (breakfast, lunch, dinner) | ❌ Missing | Add Phase D |
| Weather-aware AI planning | ❌ Missing | Add Phase D |
| Budget tracking + cost per day estimate | ❌ Missing | Add Phase D |
| Start/end times per itinerary slot | ❌ Missing | Add Phase D |
| Travel time between slots in itinerary | ❌ Missing | Add Phase D |
| Dynamic replan endpoint | ❌ Missing | Add Phase D |
| SSE streaming for itinerary generation progress | ❌ Missing | Add Phase E |
| DB schema: restaurants table | ❌ Missing | Add Phase A |
| DB schema: budget field on trips | ❌ Missing | Schema update |
| DB schema: weather_data on itinerary days | ❌ Missing | Add Phase B |
| Frontend: RestaurantCard + RestaurantGrid | ❌ Missing | Add Phase F |
| Frontend: WeatherPanel per day | ❌ Missing | Add Phase F |
| Frontend: BudgetTracker widget | ❌ Missing | Add Phase F |
| Frontend: SSE progress indicator | ❌ Missing | Add Phase F |
| Frontend: Replan button | ❌ Missing | Add Phase F |

**Already covered correctly in existing implementation.md:**
- Auth (Google OAuth + JWT)
- Property search (Booking.com + Airbnb via RapidAPI)
- Activity search (Google Places, non-restaurant types)
- Basic AI trip planning (NVIDIA NIM, single call)
- Trip CRUD
- Inquiry workflow (WhatsApp deep link)
- Observability (Sentry, Axiom, health endpoint)
- CI/CD pipeline

---

## REQUIRED CHANGES TO EXISTING PHASES

Before building the new phases below, make these changes to the existing implementation.md.

### Change 1 — Database Schema [YOU]

Run this SQL in Supabase SQL Editor. This adds missing columns and tables.

```sql
-- Add budget to trips table
ALTER TABLE trips
  ADD COLUMN budget_tier TEXT CHECK (budget_tier IN ('budget', 'comfort', 'luxury')),
  ADD COLUMN budget_per_day_usd INTEGER,
  ADD COLUMN travel_style TEXT,
  ADD COLUMN interests TEXT[];

-- Restaurants table (separate from activities — different data shape)
CREATE TABLE saved_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  restaurant_snapshot JSONB NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather cache table (avoid redundant API calls)
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key TEXT NOT NULL,  -- "{lat_2dp}:{lng_2dp}"
  forecast_date DATE NOT NULL,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_key, forecast_date)
);

-- Update property_interactions to support 'airbnb' platform
ALTER TABLE property_interactions
  DROP CONSTRAINT IF EXISTS property_interactions_platform_check;

ALTER TABLE property_interactions
  ADD CONSTRAINT property_interactions_platform_check
  CHECK (platform IN ('booking', 'airbnb'));

-- Indexes
CREATE INDEX idx_saved_restaurants_trip_id ON saved_restaurants(trip_id);
CREATE INDEX idx_weather_cache_key ON weather_cache(location_key, forecast_date);
```

### Change 2 — Google Cloud Console [YOU]

Two additional APIs need to be enabled in the same GCP project you already have:

1. GCP Console → APIs & Services → Library → enable **Distance Matrix API**
2. GCP Console → APIs & Services → Library → enable **Places API (New)** (verify it is enabled — already done)
3. Go to your existing API key → Edit → add **Distance Matrix API** to the allowed APIs list
4. The same `GOOGLE_PLACES_API_KEY` value is used for Distance Matrix — no new key needed

### Change 3 — OpenWeatherMap [YOU]

1. Go to https://openweathermap.org → create free account
2. Go to **API Keys** tab → copy the default key
3. Save as: `OPENWEATHERMAP_API_KEY`
4. Free tier: 1000 calls/day — Redis caching per location+date will keep this well within limits

### Change 4 — Existing Folder Structure Additions [AI]

Add these files to the existing folder structure:

```
backend/src/
├── routes/
│   ├── restaurants.ts        # GET /restaurants/search
│   ├── weather.ts            # GET /weather/forecast
│   └── trips.ts              # ADD: POST /trips/:id/replan (existing file, new route)
│
├── services/
│   ├── restaurantService.ts  # Google Places restaurant search + caching
│   ├── weatherService.ts     # OpenWeatherMap forecast + caching
│   ├── distanceService.ts    # Google Distance Matrix API
│   └── clusteringService.ts  # Geographic activity clustering logic
│
└── schemas/
    ├── restaurant.ts          # Zod schema: RestaurantSchema
    └── weather.ts             # Zod schema: WeatherSchema

ai-service/app/
├── routers/
│   └── replan.py             # POST /replan — dynamic trip replanning
└── services/
    ├── planner.py            # UPDATE: add restaurants + weather + preferences + budget
    └── clusterer.py          # Geographic clustering helper (pure Python, no API calls)
```

---

## PHASE A — RESTAURANT SERVICE [AI]

### A.1 — Restaurant Zod Schema

Build `backend/src/schemas/restaurant.ts`:

```ts
export const RestaurantSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  cuisine: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  priceLevel: z.number().nullable(), // 1-4, Google's price scale
  priceLevelLabel: z.enum(['Budget', 'Moderate', 'Expensive', 'Very Expensive']).nullable(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  openingHours: z.array(z.string()).nullable(),
  phoneNumber: z.string().nullable(),
  website: z.string().nullable(),
  photoUrls: z.array(z.string()),
  servesBreakfast: z.boolean().nullable(),
  servesLunch: z.boolean().nullable(),
  servesDinner: z.boolean().nullable(),
  googleMapsUrl: z.string().nullable(),
})
export type Restaurant = z.infer<typeof RestaurantSchema>
```

### A.2 — Restaurant Service

Build `backend/src/services/restaurantService.ts`:

Function `searchRestaurants(params: { lat: number, lng: number, radius: number, cuisine?: string })`:

1. Build cache key: `restaurants:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${cuisine ?? 'all'}`
2. Check Redis — if hit, return cached array (TTL: 24 hours)
3. If miss: call Google Places API (New) `POST /v1/places:searchNearby`
   - Use the same `GOOGLE_PLACES_API_KEY` header (`X-Goog-Api-Key`)
   - Include fields mask:
     `places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.formattedAddress,places.location,places.currentOpeningHours,places.internationalPhoneNumber,places.websiteUri,places.photos,places.primaryType,places.servesBreakfast,places.servesLunch,places.servesDinner,places.googleMapsUri`
   - `includedTypes`: `['restaurant', 'cafe', 'bakery', 'bar', 'food']`
   - `maxResultCount`: 20
   - `locationRestriction.circle.center`: `{ latitude: lat, longitude: lng }`
   - `locationRestriction.circle.radius`: radius (meters)
4. Map each place to `RestaurantSchema`:
   - `id`: `place.id`
   - `placeId`: `place.id`
   - `name`: `place.displayName.text`
   - `cuisine`: `place.primaryType ?? null` — convert snake_case to title case (e.g. `italian_restaurant` → `Italian Restaurant`)
   - `rating`: `place.rating ?? null`
   - `reviewCount`: `place.userRatingCount ?? null`
   - `priceLevel`: `place.priceLevel ?? null` — Google returns 1-4
   - `priceLevelLabel`: map 1→'Budget', 2→'Moderate', 3→'Expensive', 4→'Very Expensive', null→null
   - `address`: `place.formattedAddress`
   - `lat`: `place.location.latitude`
   - `lng`: `place.location.longitude`
   - `openingHours`: `place.currentOpeningHours?.weekdayDescriptions ?? null`
   - `phoneNumber`: `place.internationalPhoneNumber ?? null`
   - `website`: `place.websiteUri ?? null`
   - `photoUrls`: map `place.photos` array → build Google Places photo URL for first 2 photos:
     `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&key=${GOOGLE_PLACES_API_KEY}`
   - `servesBreakfast`: `place.servesBreakfast ?? null`
   - `servesLunch`: `place.servesLunch ?? null`
   - `servesDinner`: `place.servesDinner ?? null`
   - `googleMapsUrl`: `place.googleMapsUri ?? null`
5. Sort results by `rating DESC`
6. Store in Redis with 24-hour TTL
7. Return normalized array
8. On API error: log with Pino, return empty array — never throw

### A.3 — Restaurant Route

Build `backend/src/routes/restaurants.ts`:

`GET /api/v1/restaurants/search` (protected):
- Query params: `lat` (number), `lng` (number), `radius` (number, default 3000), `cuisine` (string, optional)
- Validate all params with Zod — return 400 if any are invalid or missing lat/lng
- Call `restaurantService.searchRestaurants(params)`
- Return: `{ restaurants: Restaurant[], cached: boolean, count: number }`

Register in `index.ts`:
```ts
app.register(restaurantRoutes, { prefix: '/api/v1' })
```

---

## PHASE B — WEATHER SERVICE [AI]

### B.1 — Weather Zod Schema

Build `backend/src/schemas/weather.ts`:

```ts
export const DayWeatherSchema = z.object({
  date: z.string(),               // YYYY-MM-DD
  tempMin: z.number(),            // Celsius
  tempMax: z.number(),            // Celsius
  description: z.string(),        // "partly cloudy", "light rain", etc.
  icon: z.string(),               // OpenWeatherMap icon code e.g. "02d"
  rainProbability: z.number(),    // 0.0 to 1.0
  humidity: z.number(),           // percentage
  windSpeed: z.number(),          // km/h
  isGoodForOutdoor: z.boolean(),  // derived: rain < 0.3 AND tempMax > 15
})
export type DayWeather = z.infer<typeof DayWeatherSchema>

export const WeatherForecastSchema = z.object({
  location: z.string(),
  days: z.array(DayWeatherSchema),
})
export type WeatherForecast = z.infer<typeof WeatherForecastSchema>
```

### B.2 — Weather Service

Build `backend/src/services/weatherService.ts`:

Function `getForecast(params: { lat: number, lng: number, days: number })`:

1. Build cache key: `weather:${lat.toFixed(1)}:${lng.toFixed(1)}`
2. Check Redis — if hit, return cached forecast (TTL: 3 hours — weather changes frequently)
3. If miss: call OpenWeatherMap 5-day forecast API:
   - `GET https://api.openweathermap.org/data/2.5/forecast`
   - Params: `lat`, `lon: lng`, `appid: OPENWEATHERMAP_API_KEY`, `units: metric`, `cnt: 40` (40 x 3hr intervals = 5 days)
4. Group 3-hourly intervals by date to build daily summaries:
   - `tempMin`: min of all intervals for that day
   - `tempMax`: max of all intervals for that day
   - `description`: description from the midday interval (12:00) of each day
   - `icon`: icon from midday interval
   - `rainProbability`: max `pop` (probability of precipitation) across all intervals for that day
   - `humidity`: average humidity across all intervals
   - `windSpeed`: average wind speed * 3.6 (convert m/s to km/h)
   - `isGoodForOutdoor`: `rainProbability < 0.3 && tempMax > 15`
5. Return only the number of days requested (slice to `params.days`)
6. Store in Redis with 3-hour TTL
7. Return `WeatherForecast` object
8. On API error: log with Pino, return null — caller handles gracefully (AI planning proceeds without weather)

### B.3 — Weather Route

Build `backend/src/routes/weather.ts`:

`GET /api/v1/weather/forecast` (protected):
- Query params: `lat` (number), `lng` (number), `days` (number, 1–7, default 5)
- Validate with Zod
- Call `weatherService.getForecast(params)`
- Return: `{ forecast: WeatherForecast | null, cached: boolean }`
- If null (API error): return `{ forecast: null, cached: false }` with status 200 — never 500

Register in `index.ts`:
```ts
app.register(weatherRoutes, { prefix: '/api/v1' })
```

---

## PHASE C — DISTANCE & CLUSTERING [AI]

### C.1 — Distance Service

Build `backend/src/services/distanceService.ts`:

This service calculates travel times between coordinates using Google Distance Matrix API.
It is called ONCE per itinerary generation — not per request. Results are cached.

Function `getTravelTimes(origins: {lat:number,lng:number}[], destinations: {lat:number,lng:number}[])`:

1. Build cache key: `distances:${hash of all coordinate pairs}`
   - Hash: use a simple deterministic hash of the sorted coordinate pairs
2. Check Redis — if hit, return cached matrix (TTL: 7 days — distances don't change)
3. If miss: call Google Distance Matrix API:
   - `GET https://maps.googleapis.com/maps/api/distancematrix/json`
   - Params:
     - `origins`: pipe-separated lat,lng pairs: `31.5,74.3|31.6,74.4`
     - `destinations`: same format
     - `mode`: `driving`
     - `units`: `metric`
     - `key`: `GOOGLE_PLACES_API_KEY` (same key — Distance Matrix is enabled on it)
   - **Limit:** max 10 origins × 10 destinations per call. If more, batch the calls.
4. Parse response: extract `duration.value` (seconds) and `distance.value` (meters) for each pair
5. Return a matrix: `{ durationSeconds: number[][], distanceMeters: number[][] }`
6. Store in Redis with 7-day TTL
7. On API error: log with Pino, return null — caller falls back to straight-line distance estimate

**Fallback function `estimateTravelTime(lat1, lng1, lat2, lng2): number`:**
- When Distance Matrix is unavailable
- Calculate haversine distance in km
- Assume 30 km/h average city speed
- Return estimated seconds: `(distanceKm / 30) * 3600`
- This is used as fallback only — never as primary

### C.2 — Clustering Service

Build `backend/src/services/clusteringService.ts`:

This service groups activities and restaurants by geographic proximity so the AI planner
assigns nearby items to the same day. This prevents the AI from planning a morning in
the north of a city and afternoon in the south.

```ts
export interface ClusterInput {
  id: string
  lat: number
  lng: number
  type: 'activity' | 'restaurant'
  data: Activity | Restaurant
}

export interface Cluster {
  centroid: { lat: number, lng: number }
  items: ClusterInput[]
  dayRecommendation: number // suggested day number (1-indexed)
}
```

Function `clusterItems(items: ClusterInput[], numDays: number): Cluster[]`:

Algorithm — simple k-means variant:
1. If `items.length <= numDays * 4`: return all items in one cluster (small destination)
2. Initialize `numDays` cluster centroids by spreading them evenly across the bounding box of all items
3. Assign each item to its nearest centroid (Euclidean distance on lat/lng — accurate enough at city scale)
4. Recalculate centroids as the mean lat/lng of all assigned items
5. Repeat steps 3-4 for 10 iterations (sufficient for convergence at city scale)
6. Assign `dayRecommendation` to each cluster (1 through numDays)
7. Return clusters sorted by longitude (west to east) — creates a natural left-to-right progression

Function `haversineDistance(lat1, lng1, lat2, lng2): number`:
- Standard haversine formula
- Returns distance in kilometers
- Used internally by clustering

**Important:** This function runs synchronously in the backend — no API calls, no async.
It is called inside the trip itinerary generation route before sending data to the AI service.

---

## PHASE D — ENHANCED AI PIPELINE [AI]

### D.1 — Update Trip Itinerary Route

**Update** `backend/src/routes/trips.ts` — the `POST /api/v1/trips/:tripId/itinerary` handler:

Current flow:
1. Fetch properties
2. Fetch activities
3. POST to AI service

New flow (replace the existing handler completely):

```
1. Fetch trip from DB (includes budget_tier, travel_style, interests, guests, destination, checkin, checkout)
2. Fetch user preferences from DB (travel_style, interests, budget_tier)
3. Run in parallel with Promise.allSettled:
   a. bookingService.searchProperties(...)
   b. airbnbService.searchProperties(...)
   c. placesService.searchActivities(...)
   d. restaurantService.searchRestaurants(...)
   e. weatherService.getForecast(...)
4. Collect results — use empty arrays/null for any failed sources
5. Calculate numDays = differenceInDays(checkout, checkin)
6. Merge activities and restaurants into ClusterInput array
7. Call clusteringService.clusterItems(mergedItems, numDays) → clusters
8. Try distanceService.getTravelTimes() on top 5 activities per cluster
   - If fails: set travelTimes = null (planner uses estimates)
9. POST to AI service /plan with enhanced payload:
   {
     destination,
     checkin,
     checkout,
     guests,
     numDays,
     userPreferences: { travelStyle, interests, budgetTier, budgetPerDayUsd },
     properties: [...booking results, ...airbnb results] (top 10, sorted by rating),
     activityClusters: clusters (clustered activities + restaurants),
     weather: forecast.days (or null),
     travelTimes: matrix (or null)
   }
10. Validate response schema
11. Save itinerary JSONB to trips table
12. Return updated trip
```

### D.2 — Add Replan Route

**Add** to `backend/src/routes/trips.ts`:

`POST /api/v1/trips/:tripId/replan` (protected):
- Body: `{ feedback?: string }` — optional user feedback ("avoid museums", "add more restaurants", etc.)
- Fetch current trip from DB — must have an existing itinerary (return 400 if none)
- Run the exact same enhanced flow as the itinerary generation above
- Add `feedback` to the AI prompt if provided
- Overwrite the existing itinerary JSONB in the DB
- Return: `{ trip: updatedTrip, regenerated: true }`
- Log: `logger.info({ tripId, userId }, 'itinerary_replanned')`

### D.3 — Enhanced AI Planner (Python)

**Replace** `ai-service/app/services/planner.py` entirely:

The planner now receives a much richer payload. Update the function signature and prompts.

```python
def generate_itinerary(
    destination: str,
    checkin: str,
    checkout: str,
    guests: int,
    num_days: int,
    user_preferences: dict,  # { travelStyle, interests, budgetTier, budgetPerDayUsd }
    properties: list,
    activity_clusters: list,  # clustered activities + restaurants
    weather: list | None,      # list of DayWeather objects or None
    travel_times: dict | None, # distance matrix or None
    feedback: str | None = None
) -> dict:
```

**Updated System Prompt:**
```python
SYSTEM_PROMPT = """You are an expert travel itinerary planner with deep knowledge of
logistics, dining, and local culture. Your output must be valid JSON matching the
schema exactly. No commentary, no markdown, no explanation — only the JSON object.

Critical rules:
- Never invent property IDs or activity IDs not present in the input data
- Never assign the same activity to two different time slots
- Respect geographic clustering — keep same-cluster items on the same day
- Respect weather — avoid outdoor activities on rainy days (isGoodForOutdoor: false)
- Assign restaurants to breakfast/lunch/dinner slots based on their serving hours
- Always include travel_time_minutes between consecutive activities
- Keep costs within the user's budget_per_day_usd if provided
- Plan realistic time slots — morning starts at 9am, afternoon 1pm, evening 6pm"""
```

**Updated User Prompt:**
```python
USER_PROMPT = f"""
Plan a {num_days}-day trip to {destination} from {checkin} to {checkout} for {guests} guests.

USER PREFERENCES:
- Travel style: {user_preferences.get('travelStyle', 'not specified')}
- Interests: {', '.join(user_preferences.get('interests', [])) or 'not specified'}
- Budget tier: {user_preferences.get('budgetTier', 'comfort')}
- Daily budget: {'$' + str(user_preferences.get('budgetPerDayUsd')) + ' USD' if user_preferences.get('budgetPerDayUsd') else 'flexible'}
{f"- Special feedback: {feedback}" if feedback else ""}

AVAILABLE PROPERTIES (top 10, use exact IDs):
{json.dumps(properties[:10], indent=2)}

ACTIVITY CLUSTERS (activities and restaurants grouped by location):
{json.dumps(activity_clusters, indent=2)}

WEATHER FORECAST (use to avoid outdoor activities on bad weather days):
{json.dumps(weather, indent=2) if weather else "Weather data unavailable — plan for typical conditions"}

TRAVEL TIME MATRIX (seconds between activities, use to estimate travel_time_minutes):
{json.dumps(travel_times, indent=2) if travel_times else "Use 20-30 minutes as default travel estimate between activities"}

Return a JSON object with EXACTLY this schema:
{{
  "summary": "2-3 sentence overview highlighting the trip character",
  "recommended_property_ids": ["id1", "id2", "id3"],
  "estimated_total_cost_usd": 0,
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "short evocative theme name",
      "weather_note": "brief note on day's weather and what to wear/bring",
      "estimated_day_cost_usd": 0,
      "morning": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "09:00",
        "end_time": "11:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 15
      }},
      "afternoon": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "13:00",
        "end_time": "15:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 20
      }},
      "evening": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "18:00",
        "end_time": "20:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 0
      }},
      "meals": {{
        "breakfast": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }},
        "lunch": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }},
        "dinner": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }}
      }}
    }}
  ],
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3"],
  "packing_suggestions": ["item 1", "item 2", "item 3"]
}}"""
```

- Call NVIDIA NIM with `temperature=0.3`, `max_tokens=8192` (increased — richer output)
- Parse and validate with Pydantic against the updated schema
- If JSON parse fails: retry once with "Output only JSON, no text before or after"
- If second attempt fails: raise HTTPException 500
- Log token usage for monitoring

### D.4 — Update Plan Router

**Update** `ai-service/app/routers/plan.py`:

Update the Pydantic request model to match the new payload:

```python
class ClusterItem(BaseModel):
    id: str
    lat: float
    lng: float
    type: str  # 'activity' or 'restaurant'
    data: dict

class Cluster(BaseModel):
    centroid: dict
    items: List[ClusterItem]
    dayRecommendation: int

class UserPreferences(BaseModel):
    travelStyle: Optional[str] = None
    interests: Optional[List[str]] = []
    budgetTier: Optional[str] = "comfort"
    budgetPerDayUsd: Optional[int] = None

class PlanRequest(BaseModel):
    destination: str
    checkin: str
    checkout: str
    guests: int
    numDays: int
    userPreferences: UserPreferences
    properties: List[dict]
    activityClusters: List[Cluster]
    weather: Optional[List[dict]] = None
    travelTimes: Optional[dict] = None
    feedback: Optional[str] = None
```

### D.5 — Add Replan Router

Build `ai-service/app/routers/replan.py`:

`POST /replan`:
- Body: same as `PlanRequest` plus `existingItinerary: dict` and `feedback: str`
- Calls `planner.generate_itinerary(...)` with `feedback` injected
- Returns the new itinerary object

Register in `main.py`:
```python
app.include_router(replan_router)
```

---

## PHASE E — SSE STREAMING [AI]

Server-Sent Events stream progress updates to the frontend during itinerary generation.
This solves the UX problem of the AI taking 10-30 seconds with no feedback.

### E.1 — SSE Route in Backend

Add to `backend/src/routes/trips.ts`:

`GET /api/v1/trips/:tripId/itinerary/stream` (protected):

This is an SSE endpoint — it streams progress events while the itinerary generates.

```ts
// SSE response headers
reply.raw.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',  // important for nginx/cloud proxies
})

const send = (event: string, data: object) => {
  reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// Step 1
send('progress', { step: 1, message: 'Searching properties...', percent: 10 })
// ... fetch properties ...

send('progress', { step: 2, message: 'Finding activities...', percent: 25 })
// ... fetch activities ...

send('progress', { step: 3, message: 'Searching restaurants...', percent: 40 })
// ... fetch restaurants ...

send('progress', { step: 4, message: 'Checking weather...', percent: 55 })
// ... fetch weather ...

send('progress', { step: 5, message: 'Clustering locations...', percent: 65 })
// ... run clustering ...

send('progress', { step: 6, message: 'AI is planning your trip...', percent: 75 })
// ... call AI service ...

send('progress', { step: 7, message: 'Saving your itinerary...', percent: 90 })
// ... save to DB ...

send('complete', { trip: updatedTrip, percent: 100 })
reply.raw.end()
```

On error at any step: `send('error', { message: 'Planning failed. Please try again.' })` then `reply.raw.end()`

**Important:** The existing `POST /trips/:tripId/itinerary` route stays as-is for non-streaming clients. The SSE route is the frontend-facing version.

### E.2 — Frontend SSE Hook

Build `frontend/hooks/useItineraryStream.ts`:

```ts
export function useItineraryStream(tripId: string) {
  const [progress, setProgress] = useState<{
    step: number
    message: string
    percent: number
  } | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStream = useCallback(async (onComplete: (trip: Trip) => void) => {
    setIsStreaming(true)
    setError(null)

    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/trips/${tripId}/itinerary/stream`,
      // EventSource doesn't support headers — pass token as query param
    )

    // Backend reads token from ?token= query param for SSE routes only
    // This is the standard SSE auth pattern

    es.addEventListener('progress', (e) => {
      setProgress(JSON.parse(e.data))
    })

    es.addEventListener('complete', (e) => {
      const { trip } = JSON.parse(e.data)
      setIsStreaming(false)
      setProgress(null)
      onComplete(trip)
      es.close()
    })

    es.addEventListener('error', (e) => {
      setIsStreaming(false)
      setError('Planning failed. Please try again.')
      es.close()
    })
  }, [tripId])

  return { progress, isStreaming, error, startStream }
}
```

**Note on SSE auth:** EventSource does not support custom headers. Pass the JWT as a query param: `?token=JWT`. Backend reads it from `request.query.token` for SSE routes only. This is safe because the connection is HTTPS and the token is short-lived.

---

## PHASE F — FRONTEND ADDITIONS [AI]

### F.1 — New Files to Add

```
frontend/
├── components/
│   └── trip/
│       ├── RestaurantGrid.tsx       # Grid of restaurant cards
│       ├── RestaurantCard.tsx       # Single restaurant card
│       ├── WeatherPanel.tsx         # Day weather widget inside ItineraryDay
│       ├── BudgetTracker.tsx        # Trip cost estimate widget
│       ├── ItineraryProgress.tsx    # SSE progress bar during AI planning
│       └── ReplanButton.tsx         # Triggers POST /replan
│
└── hooks/
    ├── useRestaurants.ts            # TanStack Query: fetch restaurants
    ├── useWeather.ts                # TanStack Query: fetch weather forecast
    └── useItineraryStream.ts        # SSE streaming hook (Phase E.2)
```

### F.2 — RestaurantCard Component

Build `frontend/components/trip/RestaurantCard.tsx`:

- `photo-card` CSS class (matches the design system)
- Top 45%: restaurant photo (first photo URL, `next/image`)
- Bottom 55% (`p-4`):
  - Restaurant name: `font-display`, `lg`, `navy-800`
  - Cuisine type: `eyebrow-slate`, small, uppercase
  - Rating row: gold stars + review count in `font-mono`
  - Price level: `font-mono`, small — display as `$` symbols matching `priceLevel` (1=`$`, 2=`$$`, 3=`$$$`, 4=`$$$$`)
  - "Open now" indicator: green dot if currently within opening hours
  - Google Maps link: Lucide `MapPin` icon + "View on Maps" → `googleMapsUrl`
- `cardVariants` animation with stagger index
- `whileHover={{ y: -2 }}`, `whileTap={{ scale: 0.98 }}`

### F.3 — RestaurantGrid Component

Build `frontend/components/trip/RestaurantGrid.tsx`:

- Props: `restaurants: Restaurant[]`, `isLoading: boolean`
- Header: "Where to eat" — `font-display`, `xl`, `navy-800` + eyebrow label "RESTAURANTS" — `eyebrow-slate`
- Filter pills: "All" · "Breakfast" · "Lunch" · "Dinner" — filter by `servesBreakfast`, `servesLunch`, `servesDinner`
  - Active pill: `navy-900` bg, white text
  - Inactive: `ivory-200` bg
  - Animate active indicator with `layoutId="restaurant-tab"`
- Grid: `grid-cols-2` on desktop, `grid-cols-1` on mobile
- Loading: 4 `SkeletonCard` components
- Empty: "No restaurants found nearby" with fork icon
- Cards stagger in with `cardVariants`

### F.4 — WeatherPanel Component

Build `frontend/components/trip/WeatherPanel.tsx`:

Props: `weather: DayWeather | null`, `date: string`

Shows inline inside each `ItineraryDay` card:

- Layout: horizontal row — icon + description + temp range + rain probability
- Weather icon: map OpenWeatherMap icon code to a Lucide icon:
  - Clear/sunny → `Sun`
  - Clouds → `Cloud`
  - Rain → `CloudRain`
  - Thunderstorm → `CloudLightning`
  - Snow → `CloudSnow`
  - Fog/mist → `CloudFog`
- Icon color: `gold-400` (sun), `slate-400` (clouds), `ocean-500` (rain)
- Temp: `font-mono`, `sm` — `${tempMin}° – ${tempMax}°C`
- Rain probability: `font-mono`, `sm`, `ocean-500` — shown only if > 10%
- If `!isGoodForOutdoor`: show amber warning chip "Consider indoor alternatives"
- If `weather === null`: show nothing (graceful — weather is optional)
- Animate in with `fadeUp` on mount

### F.5 — BudgetTracker Component

Build `frontend/components/trip/BudgetTracker.tsx`:

Props: `itinerary: Itinerary | null`, `budgetPerDay: number | null`

Display as a compact widget in the middle panel (itinerary column), below the day cards:

- Header: "TRIP ESTIMATE" — `eyebrow-slate`
- Estimated total: `font-mono`, `2xl`, `navy-900` — from `itinerary.estimated_total_cost_usd`
- Per day breakdown: small bar chart — one bar per day showing `estimated_day_cost_usd`
  - Bar height proportional to cost
  - Bars animate in with `cardVariants` stagger
  - Bars colored `ocean-500` if under budget, `ember-500` if over
- If `budgetPerDay` provided: show a horizontal dashed line across the chart at budget level
- If no itinerary yet: show skeleton
- Note below: `font-mono`, `text-xs`, `slate-400` — "Estimates are approximate"

### F.6 — ItineraryProgress Component

Build `frontend/components/trip/ItineraryProgress.tsx`:

Props: `progress: { step: number, message: string, percent: number } | null`, `error: string | null`

Shown in the middle panel (itinerary column) while SSE streaming is active:

- Full-panel overlay on the middle column: `ivory-50` background, centered content
- Animated progress bar: `motion.div` with `width: ${percent}%`, transition spring
  - Track: `ivory-300` background, `h-1`, full width, `rounded-full`
  - Fill: `ember-500` background, animated width
- Step message: `font-body`, `slate-400`, centered, changes with `AnimatePresence mode="wait"`
  - Each new message fades in/out with `onboardingStep` variant
- Retreat wordmark above: `font-display`, italic, `navy-800`
- Subtle animated dots: 3 dots bouncing with stagger (Framer Motion `staggerChildren`)
- If `error`: show error message in `ember-100` bg, `ember-500` text + "Try again" button

### F.7 — ReplanButton Component

Build `frontend/components/trip/ReplanButton.tsx`:

Place at the top of the middle panel (itinerary column), next to "Generate Plan":

- Button: "Regenerate ↺" — `btn-secondary`, small
- Only visible if `itinerary !== null`
- On click: opens a small modal (use Radix `Dialog`):
  - Title: "Regenerate itinerary" — `font-display`, `xl`
  - Optional feedback input: `input-box` placeholder "Any changes? (optional) — e.g. 'more outdoor activities'"
  - "Regenerate" button: `btn-primary`, `buttonTap`
  - On confirm: calls `startStream` from `useItineraryStream` with feedback text
  - Shows `ItineraryProgress` while streaming

### F.8 — Update Trip Detail Page

**Update** `frontend/app/trip/[tripId]/page.tsx`:

Add new hooks and components:

```ts
const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants({
  lat: trip.destinationLat,
  lng: trip.destinationLng,
  radius: 3000
})

const { data: weather } = useWeather({
  lat: trip.destinationLat,
  lng: trip.destinationLng,
  days: differenceInDays(new Date(trip.checkout), new Date(trip.checkin))
})

const { progress, isStreaming, error, startStream } = useItineraryStream(tripId)
```

**Middle panel layout update:**
```
[ReplanButton]
[ItineraryProgress (if isStreaming)]
[ItineraryPanel (if itinerary exists and !isStreaming)]
  └─ Each ItineraryDay now includes:
     ├─ WeatherPanel (top of card)
     ├─ Morning / Afternoon / Evening slots (with start_time, end_time, travel_time_to_next)
     └─ Meals section (Breakfast / Lunch / Dinner restaurant assignments)
[BudgetTracker (below day cards)]
```

**Left panel update:**
```
[PropertyStack (existing)]
```

**Right panel — add restaurant tab:**

Add a tab switcher below the map:
- "Properties" · "Activities" · "Restaurants"
- Switching the tab changes what markers are shown on the map
- Restaurant markers: fork/knife SVG icon, `emerald-500` color

### F.9 — Update ItineraryDay Component

**Update** `frontend/components/trip/ItineraryDay.tsx`:

The itinerary day card now renders the enhanced schema. Update all fields:

Each time slot now shows:
- Activity/place name
- `start_time` – `end_time` in `font-mono`, `slate-400`
- AI note (italic, `slate-400`)
- Travel time to next slot: `↓ 15 min` in `font-mono`, `slate-400`, small — only if `travel_time_to_next_minutes > 0`

Each day now includes a Meals section:
- Three rows: 🍳 Breakfast · 🥗 Lunch · 🍽 Dinner
- Each: restaurant name + brief note
- If `restaurant_id` is null: show AI suggestion as italic text (no link)
- If `restaurant_id` exists: link to the restaurant data (show `googleMapsUrl` on click)

Weather panel at the very top of each day card (before time slots):
```tsx
{weather && <WeatherPanel weather={weather.days[dayIndex]} date={day.date} />}
```

### F.10 — New TanStack Query Hooks

**Build `frontend/hooks/useRestaurants.ts`:**
- Query key: `['restaurants', lat, lng, radius]`
- Fetches `GET /api/v1/restaurants/search?lat=&lng=&radius=`
- `staleTime: 24 * 60 * 60 * 1000` (24 hours — matches Redis TTL)
- Returns `{ restaurants, isLoading, isError }`

**Build `frontend/hooks/useWeather.ts`:**
- Query key: `['weather', lat, lng]`
- Fetches `GET /api/v1/weather/forecast?lat=&lng=&days=`
- `staleTime: 3 * 60 * 60 * 1000` (3 hours — matches Redis TTL)
- Returns `{ forecast, isLoading }`

### F.11 — Update API Client

**Add to `frontend/lib/api.ts`:**

```ts
export const searchRestaurants = (params: { lat: number, lng: number, radius?: number, cuisine?: string }) =>
  api.get('/restaurants/search', { params })

export const getWeatherForecast = (params: { lat: number, lng: number, days: number }) =>
  api.get('/weather/forecast', { params })

export const replanItinerary = (tripId: string, feedback?: string) =>
  api.post(`/trips/${tripId}/replan`, { feedback })

// SSE: use EventSource directly in useItineraryStream hook, not axios
```

### F.12 — Update TypeScript Types

**Add to `frontend/types/index.ts`:**

```ts
export interface Restaurant {
  id: string
  placeId: string
  name: string
  cuisine: string | null
  rating: number | null
  reviewCount: number | null
  priceLevel: number | null
  priceLevelLabel: 'Budget' | 'Moderate' | 'Expensive' | 'Very Expensive' | null
  address: string
  lat: number
  lng: number
  openingHours: string[] | null
  phoneNumber: string | null
  website: string | null
  photoUrls: string[]
  servesBreakfast: boolean | null
  servesLunch: boolean | null
  servesDinner: boolean | null
  googleMapsUrl: string | null
}

export interface DayWeather {
  date: string
  tempMin: number
  tempMax: number
  description: string
  icon: string
  rainProbability: number
  humidity: number
  windSpeed: number
  isGoodForOutdoor: boolean
}

export interface WeatherForecast {
  location: string
  days: DayWeather[]
}

export interface MealSlot {
  restaurant_id: string | null
  restaurant_name: string
  note: string
}

export interface ItineraryTimeSlot {
  activity_id: string
  activity_name: string
  start_time: string           // "09:00"
  end_time: string             // "11:30"
  note: string
  travel_time_to_next_minutes: number
}

// Update existing ItineraryDay to match new schema:
export interface ItineraryDay {
  day: number
  date: string
  theme: string
  weather_note: string
  estimated_day_cost_usd: number
  morning: ItineraryTimeSlot
  afternoon: ItineraryTimeSlot
  evening: ItineraryTimeSlot
  meals: {
    breakfast: MealSlot
    lunch: MealSlot
    dinner: MealSlot
  }
}

// Update Itinerary:
export interface Itinerary {
  summary: string
  recommended_property_ids: string[]
  estimated_total_cost_usd: number
  days: ItineraryDay[]
  tips: string[]
  packing_suggestions: string[]
}
```

---

## ENV ADDITIONS

Add these to `backend/.env` and to GCP Secret Manager:

```env
# Weather
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key

# Frontend URL (needed for CORS in SSE route)
FRONTEND_URL=https://your-app.vercel.app
```

The `GOOGLE_PLACES_API_KEY` already covers Distance Matrix — no new key needed.

Add to GCP Secret Manager:
```powershell
echo -n "your_openweathermap_api_key" | gcloud secrets create OPENWEATHERMAP_API_KEY --data-file=- --replication-policy="automatic"
```

Update backend Cloud Run to include new secret:
```powershell
gcloud run services update retreat-backend --region us-central1 --update-secrets="OPENWEATHERMAP_API_KEY=OPENWEATHERMAP_API_KEY:latest"
```

---

## UPDATED DATABASE SCHEMA — SUPABASE SQL EDITOR [YOU]

Run Schema Change 1 from this document in Supabase SQL Editor.
This is in addition to the original schema in the main `implementation.md`.

---

## UPDATED FINAL CHECKLIST

Add these items to the Phase 12 checklist in `implementation.md`:

### New Functionality
- [ ] Restaurant search returns results for the destination
- [ ] Weather forecast loads and displays per day in itinerary
- [ ] Each itinerary day shows morning/afternoon/evening with start and end times
- [ ] Each itinerary day shows breakfast/lunch/dinner restaurant suggestions
- [ ] Travel time between activities shows between slots
- [ ] Budget estimate shows in BudgetTracker widget
- [ ] SSE progress bar shows during itinerary generation
- [ ] Replan button triggers regeneration with optional feedback
- [ ] Restaurant markers show on map in restaurant tab
- [ ] WeatherPanel shows weather icon, temp range, and rain warning per day
- [ ] Activities are geographically clustered (nearby items on same day)

---

## BUILD ORDER FOR ADDITIONS

Build these phases in strict order. Do not jump ahead.

```
Phase A (Restaurant Service) →
Phase B (Weather Service) →
Phase C (Distance + Clustering) →
Phase D (Enhanced AI Pipeline) →
Phase E (SSE Streaming) →
Phase F (Frontend Additions)
```

Test each phase locally before moving to the next:
- Phase A: `curl localhost:3001/api/v1/restaurants/search?lat=31.5&lng=74.3&radius=3000`
- Phase B: `curl localhost:3001/api/v1/weather/forecast?lat=31.5&lng=74.3&days=5`
- Phase C: unit test the clustering function with 10 sample coordinates
- Phase D: trigger itinerary generation — verify response includes `meals`, `weather_note`, `estimated_day_cost_usd`
- Phase E: open SSE endpoint in browser — verify progress events stream correctly
- Phase F: visual check that all new components render without errors
