# RETREAT Website - Complete Design Specification
## AI Agent Implementation Guide

**Design Reference**: Your original Retreat mockup design  
**Main Hero**: Animated retreat-hero videos (retreat-hero.webm, retreat-hero.mp4, retreat-hero-mobile.mp4)  
**Theme**: Hand-sketched cartoon aesthetic with Fredoka typography  
**Status**: Ready for full implementation

---

## PROJECT OVERVIEW

Build a complete Retreat website matching your design mockup exactly, with these specifications:
- Full-page hero with animated video background
- Feature sections with illustrations and copywriting
- Multi-section layout with cohesive design
- Responsive design (mobile, tablet, desktop)
- All backend APIs preserved and functional

---

## COLOR PALETTE

```
Primary Colors:
- Primary Pink:       #FF6B9D
- Primary Orange:     #FFA500
- Primary Blue:       #5A9FD4
- Dark Gray/Charcoal: #2C3E50

Light/Accent Colors:
- Light Pink:         #FFB8B8
- Light Blue:         #A8D8FF
- Light Yellow:       #FFEBA3
- Light Green:        #B8E6D5

Backgrounds:
- Cream/Off-white:    #FFFBF7
- Ivory:              #FFF5EE
- Pale Blue:          #E8F4F8
- Pale Purple:        #F0E8FF
- White:              #FFFFFF

Text:
- Dark Text:          #333333
- Medium Text:        #666666
- Light Text:         #999999
- Muted Text:         #CCCCCC
```

---

## TYPOGRAPHY

**Primary Font**: `'Fredoka', 'Segoe Print', system-ui, sans-serif`  
**Monospace Font**: `'Courier New', monospace`

**Font Weights**:
- Regular: 400
- Semibold: 600
- Bold: 700

**Font Sizes & Usage**:
- Page Title/Hero: 44-56px, weight 600
- Section Heading: 36-44px, weight 600
- Subsection: 24-28px, weight 600
- Card Title: 18-20px, weight 600
- Body Text: 14-16px, weight 400
- Small Text: 12-13px, weight 400
- Label/Tag: 11-12px, weight 500

---

## PAGE LAYOUT (TOP TO BOTTOM)

### SECTION 1: FIXED NAVBAR
**Fixed to Top**

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ▲ RETREAT    Features  How it works  Pricing  Blog     │
│  △            Resources              Sign in  Get started │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Specifications**:
- Position: Fixed, top: 0
- Background: rgba(255, 251, 247, 0.95)
- Backdrop-filter: blur(10px)
- Z-index: 100
- Padding: 16px 40px
- Border-bottom: 2px dashed #FFB8B8
- Height: ~60px

**Left Side - Logo**:
- Text: "▲ RETREAT" (or "✈️ RETREAT")
- Font-size: 20px
- Font-weight: 700
- Color: #2C3E50 (dark)
- Letter-spacing: 2px

**Center - Navigation Links** (hide on mobile < 768px):
- Links: Features | How it works | Pricing | Blog | Resources
- Font-size: 14px
- Font-weight: 500
- Color: #666
- Hover: color → #FF6B9D
- Spacing: 28px between links

**Right Side - Buttons**:
- "Sign in" button: text-only, color #666, hover #FF6B9D
- "Get started" button: gradient background (#FF6B9D → #FFA500), white text, rounded pill shape

---

### SECTION 2: HERO SECTION (FULL SCREEN)
**Starts below navbar, takes up remaining viewport**

```
┌────────────────────────────────────────────────────────┐
│                                                          │
│                   [HERO VIDEO HERE]                     │
│                                                          │
│           AI trip planning,                             │
│           made effortless.                              │
│                                                          │
│    Your personal AI travel agent that plans,            │
│    books and organizes your entire trip.                │
│                                                          │
│    [Plan my trip] [Watch demo]                          │
│                                                          │
│    TRUSTED BY TRAVELERS WORLDWIDE:                      │
│    [Booking.com] [Airbnb] [Expedia] [TripAdvisor] ...  │
│                                                          │
└────────────────────────────────────────────────────────┘
```

**Background**:
- Hero background is ANIMATED VIDEO (retreat-hero.webm, retreat-hero.mp4, retreat-hero-mobile.mp4)
- Fallback gradient: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)
- Full width, ~100vh height
- Position: relative

**Video Element Specifications**:
```jsx
<video
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }}
>
  <source src="/retreat-hero.webm" type="video/webm" />
  <source src="/retreat-hero.mp4" type="video/mp4" />
</video>
```

**Text Overlay (Centered on video)**:
- Position: absolute, top 50%, left 50%, transform translate-center
- Z-index: 10

**Hero Title**: "AI trip planning, made effortless."
- Font-size: 52px (desktop), 32px (mobile)
- Font-weight: 600
- Color: #2C3E50 or white (depending on video)
- Text-shadow: 0 2px 8px rgba(0,0,0,0.2)
- Line-height: 1.2

**Hero Subtitle**:
- Font-size: 18px (desktop), 14px (mobile)
- Color: #666
- Max-width: 600px
- Line-height: 1.6
- Text: "Your personal AI travel agent that plans, books and organizes your entire trip — flights, stays, experiences."

**Hero Buttons** (below text, still centered):
- Button 1: "Plan my trip" (Primary gradient button)
- Button 2: "Watch demo" (White outline button)
- Gap: 16px
- Margin-top: 24px

**Button Styling**:

*Primary Button*:
- Background: linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)
- Color: white
- Padding: 14px 32px
- Border: none
- Border-radius: 50px
- Font: 15px, weight 600, Fredoka
- Box-shadow: 0 6px 16px rgba(255, 107, 157, 0.3)
- Hover: transform translateY(-3px), shadow increases
- Cursor: pointer

*Secondary Button*:
- Background: white
- Color: #FF6B9D
- Padding: 14px 32px
- Border: 2px solid #FF6B9D
- Border-radius: 50px
- Font: 15px, weight 600, Fredoka
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
- Hover: background #FFF5F9
- Cursor: pointer

**Trust Badges** (below buttons):
- Text: "TRUSTED BY TRAVELERS WORLDWIDE"
- Font-size: 12px, color: #999, letter-spacing: 1px
- Spacing: 32px from buttons
- Logos: Booking.com, Airbnb, Expedia, TripAdvisor, Skyscanner, Google, Visa
- Logo size: ~40px height, grayscale
- Gap between logos: 20px

---

### SECTION 3: STATS SECTION
**Below hero, full width**

```
┌────────────────────────────────────────────────────────┐
│  25k+              4.9/5              120+              │
│  Trips planned     Rating from        Countries         │
│  every month       happy travelers     covered          │
└────────────────────────────────────────────────────────┘
```

**Background**: #FFFBF7 (cream)
**Padding**: 60px 40px
**Display**: Flex, 3 columns, centered, space-around

**Each Stat Column**:
- Text-align: center
- Number: 32px, weight 700, color #FF6B9D
- Label: 14px, weight 500, color #666
- Border-right: 1px solid #FFB8B8 (except last column)

---

### SECTION 4: OVERVIEW SECTION - "See RETREAT in action"
**Full width banner with illustration/video preview**

```
┌────────────────────────────────────────────────────────┐
│  [Illustration/Video Preview]                          │
│                          See RETREAT in action         │
│                          Watch how AI creates           │
│                          your perfect itinerary        │
│                          [Watch demo]                   │
└────────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #FFF5EE 0%, #F0E8FF 100%)
**Padding**: 80px 40px
**Layout**: Flex, space-between, align-center
**Gap**: 60px

**Left Side**:
- Illustration/image area: 50% width
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 40px
- Background: gradient (light colors)

**Right Side**: 50% width
- Title: "See RETREAT in action" (36px, weight 600)
- Subtitle: "Watch how AI creates your perfect itinerary in minutes" (16px, color #666)
- Button: "Watch demo" (primary style)
- Margin-top: 24px

---

### SECTION 5: AI TRIP PLANNER SECTION
**Two-column layout with illustration + features**

```
┌──────────────────────────────────────────────────────┐
│  [Illustration]     AI TRIP PLANNER                  │
│                     Tell us what you want.           │
│                     AI handles the rest.             │
│                                                       │
│                     ✓ Personalized itineraries       │
│                     ✓ Best-rated stays               │
│                     ✓ Built around your preferences  │
│                     [Learn more →]                    │
└──────────────────────────────────────────────────────┘
```

**Background**: #FFFBF7
**Padding**: 80px 40px
**Layout**: Grid, 2 columns (auto-fit, minmax 400px)
**Gap**: 60px

**Left Column - Illustration Area**:
- Background: linear-gradient to pale blue
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 40px
- Min-height: 400px
- Display: flex, align-center, justify-center

**Right Column - Content**:
- Subheading: "AI TRIP PLANNER" (12px, weight 600, letter-spacing 1px, color #FF6B9D)
- Title: "Tell us what you want. AI handles the rest." (32px, weight 600)
- Margin-bottom: 24px
- Feature list:
  - ✓ Personalized itineraries
  - ✓ Best-rated stays
  - ✓ Built around your preferences
  - Font: 14px, color #333
  - Margin: 12px 0
  - Checkmark: color #FF6B9D
- Link: "Learn more →" (14px, weight 600, color #FF6B9D, hover: #FFA500)

---

### SECTION 6: LIVE PREVIEW SECTION
**Two-column layout with illustration + preview info**

```
┌──────────────────────────────────────────────────────┐
│                                    [Illustration]     │
│  LIVE PREVIEW                                         │
│  Preview your trip                                    │
│  before you book.                                     │
│                                                       │
│  ✓ Live itinerary preview                            │
│  ✓ Flexible & editable                               │
│  ✓ Shared trips                                       │
│  [Learn more →]                                       │
└──────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #FFF5EE 0%, #D4F1F4 100%)
**Padding**: 80px 40px
**Layout**: Grid, 2 columns (reversed on desktop)
**Gap**: 60px

**Left Column - Content**:
- Subheading: "LIVE PREVIEW" (12px, weight 600, color #FF6B9D)
- Title: "Preview your trip before you book." (32px, weight 600)
- Features with checkmarks (same style as above)
- Link: "Learn more →"

**Right Column - Illustration**:
- Similar styling to previous section

---

### SECTION 7: BEST STAYS & FLIGHTS SECTION
**Two-column layout**

```
┌──────────────────────────────────────────────────────┐
│  BEST STAYS & FLIGHTS                                │
│  Handpicked stays from top platforms.                │
│                                                       │
│  ✓ Best rates, always                                │
│  ✓ Verified reviews                                  │
│  ✓ Secure bookings                                   │
│  [Explore →]                                         │
│                                  [Illustration Cards] │
└──────────────────────────────────────────────────────┘
```

**Background**: #FFFBF7
**Padding**: 80px 40px
**Layout**: Grid, 2 columns
**Gap**: 60px

**Left Column - Content**:
- Subheading: "BEST STAYS & FLIGHTS" (12px, weight 600, color #FF6B9D)
- Title: "Handpicked stays from top platforms." (32px, weight 600)
- Features: 3 items with checkmarks
- Link: "Explore →"

**Right Column - Cards**:
- Display: flex, column, gap 16px
- Card 1 & 2 side by side (2-column on desktop, stack on mobile)
- Each card:
  - Background: white
  - Border: 2px dashed #FFB8B8
  - Border-radius: 12px
  - Padding: 24px
  - Illustration/preview area
  - Price: "$120 / night" (large, bold)
  - Rating: "★★★★★ 4.9"

---

### SECTION 8: BOOK WITH CONFIDENCE SECTION
**Full width with illustration + content**

```
┌──────────────────────────────────────────────────────┐
│  [Passport/Travel Illustration]                      │
│                      BOOK WITH CONFIDENCE             │
│                      We handle the details,           │
│                      you enjoy the journey.           │
│                                                       │
│                      ✓ Secure payments                │
│                      ✓ 24/7 Trip support              │
│                      ✓ Protection at every step       │
│                      [Learn more →]                   │
└──────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)
**Padding**: 80px 40px
**Layout**: Grid, 2 columns
**Gap**: 60px

**Left Column - Illustration**:
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 40px
- Background: gradient

**Right Column - Content**:
- Subheading: "BOOK WITH CONFIDENCE" (12px, weight 600, color #FF6B9D)
- Title: "We handle the details, you enjoy the journey." (32px, weight 600)
- Features with checkmarks
- Link: "Learn more →"

---

### SECTION 9: HOW RETREAT WORKS SECTION
**Step-by-step numbered flow**

```
┌──────────────────────────────────────────────────────┐
│                How RETREAT works                      │
│                                                       │
│  ① Tell your plan      ② AI builds your trip        │
│     Start your           Create the perfect           │
│     information,         itinerary just for you      │
│     dates, and           with flights, stays,        │
│     preferences          activities & more.          │
│                                                       │
│  ③ Book & enjoy          [Live Preview Section]     │
│     Confirm, coordinate, [Trip Overview]            │
│     and book your       [Estimated cost]            │
│     adventure begins!    [Share to group]            │
│                                                       │
│  [Start planning now]                                 │
└──────────────────────────────────────────────────────┘
```

**Background**: #FFFBF7
**Padding**: 100px 40px
**Title**: "How RETREAT works" (44px, weight 600, centered)

**Layout**: 
- Top: 3 columns (steps 1-3)
- Bottom: Full width preview card

**Step Boxes**:
- Background: white
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 32px 24px
- Text-align: left
- Number: Large, weight 700, color #FF6B9D
- Title: 18px, weight 600
- Description: 14px, color #666

**Preview Card** (below steps):
- Background: white
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 40px
- Display: grid, 2 columns
- Left: "Your trip to Switzerland" with itinerary list
- Right: "Trip overview" section with checkmarks and estimated cost

---

### SECTION 10: WHY TRAVELERS CHOOSE RETREAT
**Feature showcase with icons**

```
┌──────────────────────────────────────────────────────┐
│            Why travelers choose RETREAT               │
│                                                       │
│  [Icon] Your personal                [Icon] Real-time │
│         AI travel agent                      Updates  │
│                                                       │
│  [Icon] 24/7 Support        [Icon] All-in-One      │
│         Always here when            Flights,         │
│         you need us                 Activities &     │
│                                     more             │
└──────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #FFF5EE 0%, #D4F1F4 100%)
**Padding**: 80px 40px
**Title**: "Why travelers choose RETREAT" (44px, centered)

**Grid**: 4 columns, auto-fit
**Gap**: 32px

**Feature Item**:
- Icon: 48px emoji/SVG
- Title: 18px, weight 600, color #FF6B9D
- Description: 14px, color #666
- Text-align: center

---

### SECTION 11: TESTIMONIALS SECTION
**Carousel/slider with quotes**

```
┌──────────────────────────────────────────────────────┐
│           Trusted by explorers around the world       │
│                                                       │
│  ⭐⭐⭐⭐⭐                                             │
│  "RETREAT planned our 10-day Japan trip perfectly.   │
│   It saved us hours of research and made our trip    │
│   unforgettable!"                                     │
│                                                       │
│  Maya Chen, New York, USA                            │
│  [Profile pic]     [< arrow] [> arrow]               │
└──────────────────────────────────────────────────────┘
```

**Background**: #FFFBF7
**Padding**: 80px 40px
**Title**: "Trusted by explorers around the world" (44px, centered)

**Testimonial Card**:
- Background: linear-gradient(135deg, #FFE8D6 0%, #D4F1F4 100%)
- Border: 2px dashed #FFB8B8
- Border-radius: 16px
- Padding: 40px 32px
- Max-width: 600px
- Margin: 0 auto

**Card Content**:
- Stars: ⭐⭐⭐⭐⭐ (28px)
- Quote: 16px, italic, color #333, line-height 1.7
- Author: 14px, weight 600, color #FF6B9D
- Location: 12px, color #999
- Avatar: 40px circle, margin-top 16px

**Navigation**: < > arrows for carousel (if implementing slider)

---

### SECTION 12: FREQUENTLY ASKED QUESTIONS
**Accordion-style Q&A**

```
┌──────────────────────────────────────────────────────┐
│          Frequently asked questions                   │
│                                                       │
│  ▼ How does RETREAT plan trips?                      │
│    Answer text here...                                │
│                                                       │
│  ▶ Which platforms does RETREAT use?                 │
│                                                       │
│  ▶ Can I customize my itinerary?                     │
│                                                       │
│  ▶ Do you offer 24/7 support?                        │
└──────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)
**Padding**: 80px 40px
**Title**: "Frequently asked questions" (44px, centered)

**Accordion Items**:
- Background: white
- Border: 1px solid #FFB8B8
- Border-radius: 8px
- Padding: 20px 24px
- Margin: 16px 0
- Cursor: pointer
- Max-width: 800px, centered

**Question**:
- Font: 16px, weight 600, color #333
- Display: flex, justify-between
- Icon: ▼ or ▶ (toggled on expand)

**Answer** (hidden by default, show on expand):
- Font: 14px, color #666
- Margin-top: 12px
- Line-height: 1.6
- Max-height: 0, overflow hidden
- Transition: max-height 0.3s ease
- On expand: max-height 500px

---

### SECTION 13: FINAL CTA SECTION
**Large, eye-catching call-to-action**

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                    ✈️ READY FOR YOUR                 │
│                    NEXT ADVENTURE?                    │
│                                                       │
│              Let us plan your perfect trip            │
│                                                       │
│              [Plan my trip]  [Watch demo]             │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Background**: linear-gradient(135deg, #FFE8D6 0%, #D4F1F4 50%, rgba(255, 224, 230, 1) 100%)
**Padding**: 100px 40px
**Text-align**: center

**Content**:
- Icon: ✈️ (64px)
- Title: "READY FOR YOUR NEXT ADVENTURE?" (44px, weight 600)
- Subtitle: "Let us plan your perfect trip" (18px, color #666)
- Buttons: 2 buttons (primary + secondary style)
- Margin-top between elements: 20px

---

### SECTION 14: FOOTER
**Full-width footer with links**

```
┌──────────────────────────────────────────────────────┐
│  RETREAT    Product        Company       Resources     │
│             ▲ Features     Blog          Documentation │
│             ▲ Pricing      Careers       Help Center   │
│             ▲ Integrations Contact                     │
│                                                       │
│  © 2024 Retreat. All rights reserved.                 │
│  [Social icons]                                       │
└──────────────────────────────────────────────────────┘
```

**Background**: #F5F5F5 linear-gradient(to right, #f5f5f5, #fafafa)
**Padding**: 60px 40px 40px 40px
**Border-top**: 2px dashed #DDD

**Layout**: Grid, 4 columns
**Gap**: 60px

**Column 1 - Brand**:
- Logo: "RETREAT" (18px, weight 700, color #2C3E50)
- Subtext: "AI Trip Planning" (12px, color #999)
- Margin-bottom: 20px

**Columns 2-4 - Links**:
- Column header: 14px, weight 600, color #333
- Links: 13px, color #666, hover #FF6B9D
- Line-height: 2.4

**Bottom Section**:
- Text: "© 2024 Retreat. All rights reserved." (12px, color #999)
- Social icons: Facebook, Twitter, Instagram, LinkedIn (aligned right)
- Margin-top: 30px
- Border-top: 1px solid #EEE
- Padding-top: 20px

---

## RESPONSIVE DESIGN BREAKPOINTS

### Desktop (1200px+)
- Full navbar with all links visible
- All sections: 2-3 columns
- Full padding: 40px+ horizontal

### Tablet (768px - 1199px)
- Navbar links may condense or go into hamburger menu
- Sections: 2 columns (auto-fit)
- Padding: 30px horizontal
- Text sizes slightly reduced

### Mobile (Below 768px)
- Hamburger menu for navbar
- All sections: 1 column stack
- Padding: 20px horizontal
- Hero height: 80vh instead of 100vh
- Text sizes:
  - Hero title: 28px
  - Hero subtitle: 14px
  - Section titles: 28px
  - Body: 13px
- Hero buttons: Full width, stack vertically
- Feature items: Grid 1 column

---

## ANIMATION & INTERACTIONS

**Hover Effects**:
- Buttons: translateY(-3px), shadow increase (0.3s)
- Card items: translateY(-4px) rotate(0.5deg), shadow increase (0.3s)
- Links: color change (0.3s)

**Transitions**:
- Default: `all 0.3s ease`
- Accordion: `max-height 0.3s ease`

**Scroll Behavior**:
- Smooth scroll enabled
- Navbar stays fixed while scrolling

---

## COMPONENT LIBRARY

### Create These Reusable Components

```
components/
├── Navbar.tsx
├── Hero.tsx (with video)
├── StatsSection.tsx
├── OverviewSection.tsx
├── AiTripPlannerSection.tsx
├── LivePreviewSection.tsx
├── BestStaysSection.tsx
├── BookWithConfidenceSection.tsx
├── HowItWorksSection.tsx
├── WhyChooseSection.tsx
├── TestimonialsSection.tsx
├── FAQSection.tsx
├── CTASection.tsx
├── Footer.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── FeatureItem.tsx
    └── AccordionItem.tsx
```

---

## IMPLEMENTATION CHECKLIST

**Phase 1: Setup**
- [ ] Create `app/globals.css` with theme variables
- [ ] Create `lib/theme.ts` with color/spacing exports
- [ ] Load Fredoka font from Google Fonts
- [ ] Verify retreat-hero videos are in `public/`

**Phase 2: Navigation & Hero**
- [ ] Build Navbar component with mobile responsiveness
- [ ] Build Hero component with video background
- [ ] Test video playback on desktop/mobile
- [ ] Implement hero buttons and trust badges

**Phase 3: Section Components**
- [ ] Build each section component (stats, overview, etc.)
- [ ] Style with dashed borders, proper spacing
- [ ] Implement hover effects and transitions
- [ ] Test responsive layouts

**Phase 4: Interactive Features**
- [ ] FAQ accordion (expand/collapse)
- [ ] Testimonial carousel (if slider needed)
- [ ] Smooth scrolling
- [ ] Mobile menu (if hamburger needed)

**Phase 5: Testing**
- [ ] Desktop responsive (1200px+)
- [ ] Tablet responsive (768px-1199px)
- [ ] Mobile responsive (below 768px)
- [ ] Video performance on all devices
- [ ] All links and buttons functional
- [ ] No console errors

**Phase 6: Deployment**
- [ ] Build test: `npm run build`
- [ ] Performance check: Lighthouse audit
- [ ] Deploy to Vercel

---

## KEY DESIGN PRINCIPLES

1. **Cartoon Aesthetic**: Use dashed borders, rounded corners, soft shadows throughout
2. **Video First**: Hero video is the star—ensure it loads fast and looks great
3. **Typography**: Fredoka everywhere, consistent weights and sizes
4. **Colors**: Use the palette consistently, maintain contrast for readability
5. **Spacing**: 40px padding on desktop, 20px on mobile
6. **Interactions**: Smooth transitions, clear hover states
7. **Responsive**: Mobile-first approach, test on real devices
8. **Accessibility**: Proper contrast, semantic HTML, alt text on images

---

## FILES TO CREATE

1. `app/page.tsx` - Main landing page
2. `app/globals.css` - Global styles with CSS variables
3. `lib/theme.ts` - Theme configuration
4. `components/layout/Navbar.tsx`
5. `components/sections/HeroSection.tsx`
6. `components/sections/StatsSection.tsx`
7. `components/sections/OverviewSection.tsx`
8. `components/sections/AiTripPlannerSection.tsx`
9. `components/sections/LivePreviewSection.tsx`
10. `components/sections/BestStaysSection.tsx`
11. `components/sections/BookWithConfidenceSection.tsx`
12. `components/sections/HowItWorksSection.tsx`
13. `components/sections/WhyChooseSection.tsx`
14. `components/sections/TestimonialsSection.tsx`
15. `components/sections/FAQSection.tsx`
16. `components/sections/CTASection.tsx`
17. `components/layout/Footer.tsx`
18. `components/ui/Button.tsx`
19. `components/ui/Card.tsx`
20. `components/ui/AccordionItem.tsx`

---

## PRODUCTION NOTES

- **Video Performance**: retreat-hero.webm loads first (best compression), MP4 as fallback
- **Mobile Video**: retreat-hero-mobile.mp4 serves to devices < 1024px (1.4 MB vs 2.7 MB saves bandwidth)
- **Build Size**: Optimize images, use WebP where possible
- **SEO**: Add proper meta tags, semantic HTML
- **Analytics**: Track button clicks, video play, form submissions
- **Accessibility**: WCAG 2.1 AA compliance, semantic markup

---

## START BUILDING! 🚀

You now have everything needed to build the exact website from your mockup. Follow this guide section by section, and you'll have a production-ready Retreat website with your animated hero videos as the centerpiece!

**Remember**: Keep the layout and structure exactly as specified, maintain the cartoon aesthetic with dashed borders and soft colors, and ensure the retreat-hero videos play smoothly across all devices.

Good luck! ✈️
