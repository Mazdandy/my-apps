# PRD — FAAS Wedding Invitation Platform

| Field | Value |
|---|---|
| Product | FAAS Wedding Invitation |
| Document version | 0.1 (Draft) |
| Status | Draft — for review |
| Reference | helloguest.id (feature benchmark) |

---

## 1. Overview

FAAS is a web platform that lets couples and event organizers **create and publish digital wedding invitation pages** (E-Invitations) by subscribing to a service. Once subscribed, a user can pick a template, fill in event data, and instantly publish a shareable invitation page that includes RSVP collection, guest wishes, and an analytics dashboard.

The model is **Subscription-as-a-Service** ("FAAS" = the platform brand): users subscribe to a plan, gain access to page creation and management features, and can optionally purchase add-ons. This differs from fully manual services (like the helloguest WhatsApp-order flow) by being **fully self-service**: no salesperson in the loop.

### 1.1 Problem Statement

- Traditional paper invitations are expensive, hard to track, and not interactive.
- Existing digital invitation services (e.g. helloguest.id) require manual ordering via WhatsApp and human-led production, which does not scale and has long turnaround.
- Couples want: beautiful pages, real-time RSVP tracking, guest management, and zero-friction publishing.

### 1.2 Vision

A self-service platform where any user can subscribe, design, and publish a premium wedding invitation in minutes — with a full admin console to manage users, templates, subscriptions, and content.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| Goal | Description |
|---|---|
| Self-service growth | Users can subscribe and publish without human intervention |
| Recurring revenue | Subscription-based monetization with optional add-ons |
| Scalability | Serve a large number of invitation pages with low marginal cost |

### 2.2 Success Metrics (KPIs)

- **Activation**: % of subscribed users who publish ≥ 1 invitation page
- **Retention**: subscription renewal rate
- **Engagement**: invitations created per user; RSVP response rate
- **Growth**: new subscriptions per month
- **Quality**: admin moderation time per reported wish/comment
- **Uptime**: public invitation page availability ≥ 99.9%

---

## 3. Target Users & Personas

### 3.1 Personas

| Persona | Description | Goals | Pain Points |
|---|---|---|---|
| **Bride/Groom (User)** | Indonesian couples planning weddings; budget-conscious; time-constrained | Publish a beautiful invitation, collect RSVPs, look premium | Manual ordering is slow; tracking guests by hand is tedious |
| **Event Organizer (User)** | Handles birthdays, engagements, aqiqah, corporate events | Reuse a template for multiple events, manage many guests | Limited tools, no analytics |
| **Admin / Operator** | Platform owner & staff | Manage users, plans, templates, payments, moderate content, see revenue analytics | Manual moderation, disputes, keeping the catalog fresh |
| **Guest (Viewer)** | Invitee who opens the public invitation link | See event details, RSVP easily, send wishes, get directions | Slow pages, confusing flows, no personal greeting |

### 3.2 User Types (per requirements)

| Type | Access |
|---|---|
| **Admin** | Platform admin console — full management of users, templates, plans, subscriptions, payments, and content moderation |
| **User** | Subscriber of the platform — creates and manages their own invitation pages and guests |
| **Guest** | Unauthenticated visitor — views a published invitation page and submits RSVP / wishes |

---

## 4. Roles & Permissions

| Capability | Admin | User |
|---|---|---|
| Register / login | ✅ | ✅ |
| Browse subscription plans | ✅ | ✅ |
| Subscribe / renew / cancel subscription | ✅ (manage others) | ✅ (own) |
| Create & edit invitation pages | — | ✅ |
| Publish / unpublish page | — | ✅ |
| Manage guests & send invitations | — | ✅ |
| View RSVP & analytics | — | ✅ (own pages) |
| Manage templates/themes (CRUD, pricing, publish) | ✅ | — |
| Manage subscription plans (CRUD, pricing) | ✅ | — |
| Manage users (list, block, reset) | ✅ | — |
| View payments / orders / refunds | ✅ | — |
| Moderate wishes/comments (delete, report) | ✅ | ✅ (own page wishes) |
| Platform analytics (revenue, active pages) | ✅ | — |

---

## 5. Core User Journeys

### 5.1 User Journey: Publish an Invitation

1. Register / login to FAAS.
2. Choose and purchase a subscription plan (or start free trial).
3. Browse the template catalog and select a theme.
4. Fill the invitation data form (couple names, date, venue, gallery, story, etc.).
5. Preview the page; add optional add-ons (custom domain, advanced RSVP, sessions).
6. Publish → a unique link is generated; user can customize the URL (e.g. `faas.id/u/dandy-nur`) with a friendly name of their choice.
7. Add guests to the guest list; share via copied message / WhatsApp (personalized name auto-inserted).
8. Track RSVP, wishes, and page opens in the Smart Dashboard.

### 5.2 Admin Journey: Manage Platform

1. Log in to the admin console.
2. Review new registrations and subscription payments.
3. Upload/publish new templates with pricing.
4. Moderate reported wishes and page content.
5. View revenue and platform analytics.

---

## 6. Functional Requirements

Requirements are tagged `FR-<id>` for traceability. Priority: **P0** (MVP), **P1** (soon after), **P2** (later).

### 6.1 Authentication & Accounts

| ID | Requirement | Priority |
|---|---|---|
| FR-101 | Email + password registration with email verification | P0 |
| FR-102 | Social login (Google) as an option | P1 |
| FR-103 | Password reset via email | P0 |
| FR-104 | Profile management (name, phone, avatar) | P0 |
| FR-105 | Role-based access control: `admin` and `user` | P0 |
| FR-106 | Admin can view/block/reset user accounts | P1 |

### 6.2 Subscription & Billing

| ID | Requirement | Priority |
|---|---|---|
| FR-201 | Published subscription plans with name, price, period, and included features | P0 |
| FR-202 | Plans: **Free Trial**, **Pro**, **Business** (see §6.9) | P0 |
| FR-203 | Payment via payment gateway (e.g. Midtrans/Xendit) supporting VA, QRIS, e-wallet, card | P0 |
| FR-204 | Subscription activation on successful payment; expiry handling | P0 |
| FR-205 | Subscription renewal (auto or manual) and upgrade/downgrade | P1 |
| FR-206 | Admin can issue refunds/cancel subscriptions and edit user plan | P1 |
| FR-207 | Invoices / payment history per user | P1 |
| FR-208 | Feature gating by plan: page count, guest limit, add-on eligibility | P0 |
| FR-209 | Optional add-ons purchasable separately: custom domain, advanced RSVP, session system, digital guestbook, bilingual, express priority | P1 |

### 6.3 Template / Theme Catalog

| ID | Requirement | Priority |
|---|---|---|
| FR-301 | Catalog of invitation templates with category, preview, price (or included in plan) | P0 |
| FR-302 | Template preview mode (guest-view simulation) before purchase | P0 |
| FR-303 | Templates support configurable sections (each section can be toggled on/off) | P0 |
| FR-304 | Template color/theme customization (preset palettes + custom color picker) | P0 |
| FR-305 | Template font selection from a curated font list | P1 |
| FR-306 | Admin CRUD for templates: upload, set price/availability, publish/unpublish | P0 |
| FR-307 | Tags/categories: wedding, engagement, birthday, aqiqah, corporate, anniversary | P1 |

### 6.4 Invitation Page Builder (User)

| ID | Requirement | Priority |
|---|---|---|
| FR-401 | Create invitation pages up to plan limit; list & manage own pages | P0 |
| FR-402 | Data-entry form per template: couple names, parents, event date/time, venue, maps link, story, quotes, gallery, etc. | P0 |
| FR-403 | Image & video upload for cover, gallery (with cloud storage) | P0 |
| FR-404 | Music/backsound selection with play/stop button on the page | P0 |
| FR-405 | Countdown timer to event date (auto-computed) | P0 |
| FR-406 | Personalize each guest's greeting name (per-guest link override) | P0 |
| FR-407 | Section toggles: unused sections auto-hide (Our Story, Gift/Account, Live Streaming, etc.) | P0 |
| FR-408 | Draft → preview → publish workflow; edit after publishing | P0 |
| FR-409 | Generate unique public URL per invitation in the form `web.com/u/{nama-url}`; the user can customize the URL segment (e.g. `dandy-nur`) when creating/editing the invitation. Slug must be unique, URL-safe (lowercase, no spaces), and changeable while keeping the old link redirecting (or showing a notice) if the old URL was already shared | P0 |
| FR-410 | Revisions keep link stable; history of versions | P2 |
| FR-411 | Page active period: 1 year after event date, then auto-expiry notice (admin-configurable) | P1 |
| FR-412 | Multi-language content (ID/EN + more), guest selects language; pay-per-language as add-on | P1 |

### 6.5 Public Invitation Page (Guest-Facing)

Sections modeled on helloguest.id feature set.

| ID | Requirement | Priority |
|---|---|---|
| FR-501 | Cover page with photo/video, couple names, event date; opening animation | P0 |
| FR-502 | Personalized guest name on the cover ("Kepada Bapak/Ibu {name}") when link carries a guest token | P0 |
| FR-503 | Backsound music player with play/pause | P0 |
| FR-504 | Countdown timer | P0 |
| FR-505 | Quote / holy verse section | P0 |
| FR-506 | Bride & groom profiles + parents info | P0 |
| FR-507 | Event details with date, time, venue + **Google Maps** embed / direction link | P0 |
| FR-508 | **RSVP form** (attend / maybe / not attend; guest count). After a guest confirms attendance, their name and wishes appear below in the live feed **real-time** (auto-updates, no page reload) | P0 |
| FR-509 | **Wishes & prayers form** with public display list; the list updates **real-time** as guests confirm RSVP and post wishes | P0 |
| FR-510 | Gallery (photos + optional video) | P1 |
| FR-511 | Gift/account section — supports **multiple accounts** (multiple banks/e-wallets, each with number & name) and optional gift address — toggleable | P1 |
| FR-512 | Live streaming link section — toggleable | P1 |
| FR-513 | "Add Yours" Instagram filter/link section — toggleable | P2 |
| FR-514 | Our Story / love journey timeline — toggleable | P1 |
| FR-515 | Dress code guidance section — toggleable | P2 |
| FR-516 | Event rundown/schedule section — toggleable | P2 |
| FR-517 | Save-to-calendar (Google Calendar .ics) | P2 |
| FR-518 | Responsive layout (mobile-first) for all devices | P0 |
| FR-519 | Share button (WhatsApp, copy link, social) | P0 |
| FR-520 | Loading screen with couple initials/logo | P1 |

### 6.6 Smart Dashboard (Guest & RSVP Management) — User

| ID | Requirement | Priority |
|---|---|---|
| FR-601 | Guest list: add/import/delete guests; per-guest unique link. **Contact import**: user can import guests directly from their phone contacts (name + phone number), via the Contacts API on mobile browsers / device contact picker — plus the existing paste-many-names textarea | P0 |
| FR-602 | Guest grouping (e.g. Groom's side, Bride's side, Session 1/2/3) | P0 |
| FR-603 | Group link: whole group can RSVP via one link | P1 |
| FR-604 | Broadcast templates: customizable WhatsApp/copy message per guest (name auto-filled) | P0 |
| FR-605 | Optional WhatsApp auto-send via WhatsApp API | P2 |
| FR-606 | Mark guests as "sent" / "not sent" | P0 |
| FR-607 | Open tracking: see if/when a guest opened the link | P1 |
| FR-608 | RSVP summary stats: attending / maybe / not attending, total attendees, real-time | P0 |
| FR-609 | Per-guest RSVP detail (attend status, number of people) | P0 |
| FR-610 | Export RSVP & guest data to CSV/Excel | P0 |
| FR-611 | Wishes moderation: delete/approve wishes on own page | P0 |
| FR-612 | Dashboard home: page performance summary (opens, RSVPs, wishes) | P0 |
| FR-613 | Add-on: **Advanced RSVP** — custom questions, vehicle type, adult/child count | P1 |
| FR-614 | Add-on: **Session system** — split info visibility by session group (up to 3 sessions) | P1 |
| FR-615 | Add-on: **Digital Guestbook** — QR code per guest; scan at check-in logs attendance with selfie/time | P2 |
| FR-616 | Add-on: **Custom domain** — map own domain to invitation link | P1 |

### 6.7 Admin Console

| ID | Requirement | Priority |
|---|---|---|
| FR-701 | Admin dashboard: revenue, subscriptions, active pages, user counts | P0 |
| FR-702 | User management: list, search, view detail, block, change plan | P0 |
| FR-703 | Subscription/order management: view all payments, statuses, refunds | P0 |
| FR-704 | Template management: CRUD, pricing, publish (see FR-306) | P0 |
| FR-705 | Plan management: CRUD plans and feature limits | P0 |
| FR-706 | Content moderation: flag/report queue for wishes and pages; delete | P1 |
| FR-707 | Promo/coupon codes for discounts | P2 |
| FR-708 | Support ticket inbox (or WhatsApp routing) | P2 |

### 6.8 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-801 | Email notifications: verification, payment success/failure, subscription expiring | P0 |
| FR-802 | User notifications: new RSVP, new wish (dashboard bell) | P1 |
| FR-803 | Admin notifications: new subscription, flagged content | P1 |

### 6.9 Subscription Plans (Proposed)

| Feature | Free Trial | Pro | Business |
|---|---|---|---|
| Price | Rp 0 | Rp 99.000 / 3 months | Rp 199.000 / 6 months |
| Invitation pages | 1 | 3 | Unlimited |
| Templates | Selected free templates | All templates | All templates + priority new themes |
| Guests per page | 50 | 500 | Unlimited |
| RSVP + Wishes | ✅ | ✅ | ✅ |
| Guest management & broadcast | ✅ | ✅ | ✅ |
| Analytics & export | ❌ | ✅ | ✅ |
| Remove FAAS branding | ❌ | ✅ | ✅ |
| Custom domain add-on | ❌ | ✅ (paid add-on) | ✅ (paid add-on) |
| Support | Community | Chat | Priority chat |

> Note: prices are placeholders. Final pricing is a business decision; structure must be configurable by admin (FR-705).

---

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Public invitation page initial load ≤ 3s on 4G; images/videos served via CDN; pages must feel native on mobile |
| **Scalability** | Serverless-friendly architecture (in line with "FAAS" positioning): static page generation or edge rendering for invitation pages; auto-scale for spikes (wedding season) |
| **Security** | HTTPS everywhere; encrypted storage for user data & payment data; rate limiting on forms; XSS-safe wish rendering (no raw HTML); role-based access on all APIs |
| **Reliability** | Uptime ≥ 99.9% for public pages; backups; graceful handling when event passes expiry date |
| **Compliance** | Indonesia data protection (UU PDP); payment gateway PCI-compliance via provider; clear privacy policy & terms |
| **Observability** | Structured logging, error tracking, analytics events (page view, RSVP submit, payment) |
| **SEO/Social** | OG tags per invitation (title, image, description) so links look premium on WhatsApp/Instagram |

---

## 8. High-Level Data Model

```
User          (id, role[admin|user], name, email, password_hash, status)
Plan          (id, name, price, period_days, feature_limits{...}, active)
Subscription  (id, user_id, plan_id, status[active|expired|canceled], starts_at, ends_at)
Payment       (id, user_id, subscription_id, gateway, amount, status, created_at)
Template      (id, name, category, price, config_schema, sections[], thumbnail, active)
Invitation    (id, user_id, template_id, slug, data(JSON), cover_media, music_url,
               status[draft|published|expired], event_at, published_at, expires_at)
Guest         (id, invitation_id, name, phone, group, token, unique_url, sent_status,
               opened_at)
Rsvp          (id, guest_id, invitation_id, status[yes|maybe|no], qty_adult, qty_child,
               answers(JSON), created_at)
Wish          (id, invitation_id, name, message, status[visible|hidden|flagged], created_at)
AddonPurchase (id, subscription_id, addon_key, amount, expires_at)
```
Relations: `Invitation 1—N Guest`, `Guest 1—1 Rsvp`, `Invitation 1—N Wish`, `User 1—N Invitation`.

---

## 9. Assumptions & Open Questions

### Assumptions
- "FAAS" is the product brand; the name may also imply the platform is delivered as a service (serverless/on-demand).
- Target market is Indonesia (based on helloguest.id reference); Bahasa Indonesia is the primary UI language, English secondary.
- Payments go through an Indonesian payment gateway (Midtrans/Xendit class).
- Pages are shareable unlimited times without per-link cost (matches helloguest model).

### Open Questions
1. Is pricing **subscription-only**, **per-template one-time fee**, or **hybrid** (subscription + paid add-ons)? (§6.9 assumes hybrid)
2. Should guests be able to RSVP without a personal token (public link), or must they come from a guest link?
3. Does the admin manage template *designs* (built by the team) or should there be a community/designer submission flow?
4. Is WhatsApp auto-send required at launch or can it be copy-message only (FR-605)?
5. What is the intended scale at launch (users, pages, concurrent RSVP traffic) — drives infra decisions.
6. Do users need multi-event types at launch (wedding only), or all categories from day one?

---

## 10. Roadmap (Suggested Milestones)

| Phase | Scope | Exit Criteria |
|---|---|---|
| **M0 — MVP (P0 only)** | Auth (FR-101/103/105), plans + Midtrans payment (FR-201–208), 5 starter templates (FR-301–304), page builder (FR-401–409), public page core sections (FR-501–509, FR-518–519), guest list + broadcast + RSVP dashboard + export (FR-601–611), admin console basics (FR-701–705) | A user can subscribe, publish an invitation, add guests, and receive RSVPs end-to-end |
| **M1 — Retention** | Open tracking, wishes moderation, gallery/live streaming/gift sections, multi-language, WhatsApp auto-send, notifications, analytics polish | Dashboard shows full guest lifecycle; features match helloguest baseline |
| **M2 — Monetization & Premium** | Add-ons: custom domain, advanced RSVP, session system, digital guestbook, express priority; promo codes; admin content moderation queue | Add-on revenue stream live; premium plans differentiated |
| **M3 — Scale & Extras** | Save-to-calendar, Instagram Add Yours, dress code/rundown sections, community templates, support tickets, platform analytics reporting | Platform supports larger user base; ops overhead minimal |

---

## 11. Out of Scope (v1)

- Native mobile apps (responsive web only)
- Offline access to invitation pages
- Print/physical invitation fulfillment
- Marketplace for freelance designers
- Multi-currency / international payments
- On-premise deployment; cloud/SaaS only
