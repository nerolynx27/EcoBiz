# Fertilizer and Delivery UI Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Match the approved three-screen concept in an isolated EcoBiz frontend sandbox.
**Architecture:** Reuse Next.js, shared demo context and existing meal journeys. Add a focused commerce context and shared visual shell for fertilizer/delivery routes; a review board renders the same live components in three phone frames.
**Tech Stack:** Existing Next.js 16, React 19, TypeScript, CSS Modules, Node assertions, Playwright. No dependencies added.
**Spec:** ../specs/2026-10-21-commerce-ui.md

## Global Constraints
- Current app remains untouched; all edits in the managed sandbox on codex/fertilizer-delivery-ui.
- Match the approved image, use short copy and actual reference art.
- Sample frontend only; independent persistence key; retain meal and staff flows.
- Integer-sen prices, labelled controls, keyboard support, responsive widths 320/390/768/1440.

## Review Focus
- Repeat job acceptance/completion must never duplicate work or earnings.
- Pack changes must use the correct price and order snapshot.
- Refresh/corrupt storage must recover without breaking existing meal data.
- Offline runners must not accept jobs; accepted jobs remain actionable.
- Narrow screens and large text must keep controls reachable.

### Task 1: Demo state and shared visual shell
**Files:** src/lib/commerce.ts, src/components/commerce/CommerceProvider.tsx, CommerceShell.tsx, CommerceIcon.tsx, Commerce.module.css; src/app/layout.tsx; tests/commerce.ts.
**Interfaces:** initialCommerceState, commerceReducer(state, action), useCommerce(); CommerceShell children wrapper; CommerceIcon name prop.
- [x] Write assertion tests for pricing, order snapshots, offline/concurrent acceptance, handover validation, once-only earnings and malformed restoration. Run red.
- [x] Implement the typed reducer and restoration validation, provider with separate localStorage key, native HTML visual shell and reference-art windows.
- [x] Run assertions green and existing npm test.

### Task 2: Fertilizer and My Orders
**Files:** src/components/commerce/Fertilizer.tsx, Orders.tsx; src/app/fertilizer/page.tsx, orders/page.tsx; tests/commerce-browser.mjs.
**Interfaces:** Fertilizer component adds snapshot via useCommerce; Orders reads snapshots. Nav routes to /orders while meal history stays /reservations.
- [x] Add browser checks for missing routes, 3kg price RM20.00, pickup/delivery selection, dialog confirmation and refresh recovery. Run red before UI implementation.
- [x] Implement reference-exact product cards, pack buttons, fulfillment choice and accessible sample-order dialog; implement short order history and meal-reservation link.
- [x] Verify interactions and image rendering.

### Task 3: Delivery, runner and review board
**Files:** src/components/commerce/Delivery.tsx, Runner.tsx; src/app/delivery/page.tsx, delivery/runner/page.tsx, sandbox/page.tsx; shared Commerce.module.css; existing EcoBiz.tsx navigation.
**Interfaces:** Delivery and Runner use the same context; /sandbox renders all three screens with local view switching disabled only when navigation is selected through normal links.
- [x] Extend browser checks for tracking, tab navigation, offline acceptance, pickup/code completion, duplicate action prevention, keyboard dialog and 320/390/768/1440 overflow.
- [x] Implement tracker, runner jobs, source-art cyclist/avatar, all five nav links and three-phone visual board.
- [x] Run typecheck, lint, unit suite, production build, focused browser suite and retained browser journeys (update renamed My Orders nav assertion).
- [x] Save and inspect mobile/desktop screenshots against the approved concept; fix visible differences; open sandbox preview on a separate port.

## Execution record
- Baseline npm test: all existing rule and operations groups passed.
- Assets: approved image copied to public/art/commerce/approved-concept.png; CSS windows reuse its imagery without baking text/controls into the page.
- Execution: inline, as requested by the user; no merge/publish.
