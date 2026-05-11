# Gumtree.com vs Our App — Feature Gap Audit

> Captured 2026-05-11. Source: `https://www.gumtree.com/` homepage + nav + footer
> compared against our codebase in `src/app/**` and `supabase/migrations/**`.

This is the backlog driving the next wave of work. Items are ordered roughly by
impact / effort. P0 picked first: **Postcode + radius distance search**.

---

## Category taxonomy

| Gumtree | Ours |
| --- | --- |
| 7 top: Cars/Vehicles, For Sale, Services, Property, Pets, Jobs, Community | 8 top: cars-vehicles, home-garden, services, kids-baby, fashion, sport-leisure, electronics, property |
| Deep subcategory tree per top (30+ Jobs subcats, 11 Pets, 9 Property, 22 For-Sale, 17 Services) | Flat — `categories` table has `parent_id` column but unclear if populated |
| Has Pets, Jobs, Community verticals | Missing entirely |
| Property splits: For Sale / To Rent / To Share / To Swap / Commercial / Parking / Holiday / Wanted | Single `property` cat |

## Listing types / verticals (largest gaps)

- **Jobs vertical** — 28 categories, employer flow, salary, contract type. Missing.
- **Pets vertical** — breed, age, vaccination, equipment. Missing.
- **Community** — events, rideshare, lost-and-found, classes, skill swap. Missing.
- **Property rental subtype** — pcm/pw price units, "Date available", deposit, furnished, bedrooms, EPC. Missing.
- **Motors structured data** — make/model/year/mileage/fuel/transmission/MOT. Listings only have free-text.
- **"Wanted"** listings (reverse: buyer asks) per category. Missing.
- **Swap shop / Freebies** subtypes. Missing.

## Search / browse

| Gumtree | Ours |
| --- | --- |
| Location-bound search (postcode + radius miles) | Free-text location only |
| Filter by distance, category, sub-category, price range, condition, delivery option, seller type (private/dealer) | Basic filters — no radius/distance, no seller-type, no delivery |
| Vertical-specific filters (cars: make/model/year/mileage; jobs: salary; property: beds) | None |
| "Saved searches" with email alerts | DB has `saved_searches` table — UI/cron unclear |

## Monetisation

- **Spotlight / Featured / Urgent / Bump-up paid promotions**. Schema has `is_urgent` bool but no checkout. Missing.
- **Business/Dealer accounts** with bulk posting + branded profile. Missing.
- **Gumtree for Business** tier. Missing.

## Trust / Safety

- **Verified badge** for phone/ID. Missing.
- **Safety Centre** / scam education page. Missing.
- **Buyer protection / secure pay**. Missing.
- Reports + moderation. Have it.
- **Block/mute user**. Likely missing.

## Account / Profile

- Have: My Ads, Watchlist, Reviews, Profile, Password change.
- Missing: Saved-searches UI, purchase history, billing/invoices (for paid features), public dealer page.

## Posting flow

- Have: multi-step category → details → photos → location → review.
- Gumtree has category-specific forms (jobs ≠ cars ≠ property). Ours is generic.
- Gumtree allows draft autosave between sessions. Status `'draft'` exists — unclear if UI surfaces it.

## Messaging

- Have: inbox + chat thread + realtime + unread badge.
- Missing: message templates / quick replies, block sender, report message (we have AI safety check).
- Phone reveal flow (gumtree masks phone). Missing.

## Mobile / Apps

- Gumtree has iOS + Android apps. We are web-only.
- PWA manifest would be a cheap win.

## Content / SEO surfaces

- Editorial: Car Guides, Car Reviews, Buying Guides, Best Cars. Missing.
- Top Locations SEO hubs (e.g. `/london`, `/manchester`). We have `?location=` but no landing pages.

## Compliance / Legal

- Gumtree shows FCA disclosures, credit-broker info, company reg, VAT, address. Ours: footer skeleton.
- Cookie consent banner. Missing.
- Privacy Settings / Manage Utiq (consent management). Missing.

## Things WE have that Gumtree does not surface

- Claude AI: description gen, title improver, price suggester, smart-search NL parser, message safety check.
- Admin moderation panel (pending/rejected + reports triage).
- Listing expiry cron + renewal flow.
- Realtime messaging.

---

## Prioritised backlog

| Priority | Item | Effort | Value |
| --- | --- | --- | --- |
| **P0** | Postcode + radius distance search | M | Core marketplace UX — biggest gap |
| **P0** | Cookie consent + privacy settings | S | Legal requirement (UK GDPR) |
| **P0** | Saved-search UI + email alerts (schema exists) | S | Return-traffic driver |
| **P1** | Subcategory hierarchy populated + filter UI | M | SEO + browsing |
| **P1** | Category-specific listing fields (cars: make/model/year/mileage; property: beds/furnished/pcm) | M | Vertical credibility |
| **P1** | Seller type filter (private/dealer) + dealer account tier | M | Monetisation foundation |
| **P1** | Promoted/Featured paid listings (Stripe + `featured_until` col) | M | Revenue path |
| **P2** | Pets + Jobs + Community verticals | L | Surface parity |
| **P2** | City SEO landing pages | S | Free organic traffic |
| **P2** | PWA manifest + service worker | S | Mobile install path |
| **P2** | Verified-phone badge + 2FA | M | Trust signal |
| **P3** | "Wanted" listing type | S | Inventory diversity |
| **P3** | Public dealer storefront | M | Premium tier feature |
| **P3** | Buying guides / editorial CMS | L | SEO long-tail |

---

## Currently in progress

- **Postcode + radius distance search** — branch `feat/postcode-radius-search`.
