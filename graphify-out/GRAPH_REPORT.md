# Graph Report - landing_page_backup4  (2026-10-20)

## Corpus Check
- 119 files · ~2,066,782 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 746 nodes · 1211 edges · 118 communities (53 shown, 65 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30c7b414`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Planos.tsx
- button.tsx
- App.tsx
- cn
- sidebar.tsx
- hooks/use-toast.ts
- compilerOptions
- utils.ts
- pagination.tsx
- compilerOptions
- components.json
- form.tsx
- carousel.tsx
- dependencies
- ScrollFrames
- DESLOVABLE_PLAN.md — Plano de refatoração para remover amarras do Lovable
- public-signup-trial/index.ts
- compilerOptions
- devDependencies
- chart.tsx
- command.tsx
- Nexus — Landing Page (landing_page_backup4)
- sheet.tsx
- table.tsx
- scripts
- breadcrumb.tsx
- drawer.tsx
- navigation-menu.tsx
- select.tsx
- toggle-group.tsx
- FAQSection.tsx
- package.json
- alert.tsx
- input-otp.tsx
- confirm-trial-email/index.ts
- avatar.tsx
- create-abacate-checkout/index.ts
- start-email-verification/index.ts
- create-account-after-payment/index.ts
- class-variance-authority
- clsx
- date-fns
- embla-carousel-react
- eslint
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- framer-motion
- @hookform/resolvers
- input-otp
- jsdom
- lovable-tagger
- lucide-react
- next-themes
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-aspect-ratio
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-toast
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- react
- react-day-picker
- react-dom
- react-hook-form
- react-router-dom
- recharts
- sonner
- @supabase/supabase-js
- tailwind-merge
- tailwindcss-animate
- @tanstack/react-query
- vaul
- zod
- postcss
- tailwindcss
- @tailwindcss/typography
- @testing-library/jest-dom
- @testing-library/react
- @types/node
- @types/react
- typescript
- typescript-eslint
- vite
- @vitejs/plugin-react-swc
- verify-email-token/index.ts
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `cn()` - 228 edges
2. `Button` - 21 edges
3. `compilerOptions` - 20 edges
4. `compilerOptions` - 14 edges
5. `ScrollFrames()` - 10 edges
6. `buttonVariants` - 9 edges
7. `compilerOptions` - 9 edges
8. `scripts` - 8 edges
9. `Card` - 8 edges
10. `CardHeader` - 8 edges

## Surprising Connections (you probably didn't know these)
- `NavLink` --calls--> `cn()`  [EXTRACTED]
  src/components/NavLink.tsx → src/lib/utils.ts
- `AlertDialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (118 total, 65 thin omitted)

### Community 0 - "Planos.tsx"
Cohesion: 0.08
Nodes (38): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, supabase, CompositeTypes (+30 more)

### Community 1 - "button.tsx"
Cohesion: 0.09
Nodes (26): AboutSection(), CTASection(), DemoVideoDialog(), FeatureDetails, FeatureDetailsDialog(), FeatureDetailsDialogProps, FeaturesSection(), Footer() (+18 more)

### Community 2 - "App.tsx"
Cohesion: 0.08
Nodes (35): AnalyticsObserver(), App(), queryClient, Badge(), BadgeProps, badgeVariants, Toaster(), ToasterProps (+27 more)

### Community 3 - "cn"
Cohesion: 0.09
Nodes (35): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+27 more)

### Community 4 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): Input, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 5 - "hooks/use-toast.ts"
Cohesion: 0.12
Nodes (24): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+16 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, src, vitest/globals, compilerOptions, allowImportingTsExtensions, baseUrl (+18 more)

### Community 7 - "utils.ts"
Cohesion: 0.08
Nodes (14): NavLink, NavLinkCompatProps, Checkbox, HoverCardContent, PopoverContent, Progress, ResizableHandle(), ResizablePanelGroup() (+6 more)

### Community 8 - "pagination.tsx"
Cohesion: 0.10
Nodes (20): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+12 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 10 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 11 - "form.tsx"
Cohesion: 0.19
Nodes (12): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+4 more)

### Community 12 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 13 - "dependencies"
Cohesion: 0.15
Nodes (13): cmdk, dependencies, cmdk, @radix-ui/react-avatar, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-tooltip, react-resizable-panels (+5 more)

### Community 14 - "ScrollFrames"
Cohesion: 0.27
Nodes (12): FRAME_URLS, FrameRecord, ScrollFrames(), handleMotionChange(), paint(), pumpQueue(), releaseImage(), reserveCacheSlot() (+4 more)

### Community 15 - "DESLOVABLE_PLAN.md — Plano de refatoração para remover amarras do Lovable"
Cohesion: 0.17
Nodes (11): Checkout (extra), Contexto, Critério de pronto, DESLOVABLE_PLAN.md — Plano de refatoração para remover amarras do Lovable, Gestão (`gestao_backup4`) — Edge Functions do portal, Gestão — Reset de senha, Landing (`landing_page_backup4`), Objetivo (+3 more)

### Community 16 - "public-signup-trial/index.ts"
Cohesion: 0.20
Nodes (6): normalizeAddress(), normalizePhoneBR(), normalizeText(), onlyDigits(), Payload, schema

### Community 17 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, baseUrl, noImplicitAny, noUnusedLocals, noUnusedParameters, paths, skipLibCheck (+3 more)

### Community 18 - "devDependencies"
Cohesion: 0.18
Nodes (11): autoprefixer, @eslint/js, globals, devDependencies, autoprefixer, @eslint/js, globals, @types/react-dom (+3 more)

### Community 19 - "chart.tsx"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 20 - "command.tsx"
Cohesion: 0.18
Nodes (9): Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 22 - "Nexus — Landing Page (landing_page_backup4)"
Cohesion: 0.22
Nodes (8): Deploy, Documentação de comportamento (fonte de verdade), Integrações, Nexus — Landing Page (landing_page_backup4), Notas, Papel no ecossistema, Rodar local, Status atual

### Community 23 - "sheet.tsx"
Cohesion: 0.25
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 24 - "table.tsx"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 25 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, build:dev, dev, lint, preview, test, test:watch

### Community 26 - "breadcrumb.tsx"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 27 - "drawer.tsx"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 28 - "navigation-menu.tsx"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 29 - "select.tsx"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 30 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 31 - "FAQSection.tsx"
Cohesion: 0.53
Nodes (4): FAQSection(), AccordionContent, AccordionItem, AccordionTrigger

### Community 32 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 33 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 34 - "input-otp.tsx"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 36 - "avatar.tsx"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 37 - "create-abacate-checkout/index.ts"
Cohesion: 0.50
Nodes (3): corsHeaders, KIWIFY_CHECKOUTS, schema

### Community 38 - "start-email-verification/index.ts"
Cohesion: 0.50
Nodes (3): corsHeaders, NOTE: provider defaults in DB; checkout URL is generated later (Kiwify), schema

## Knowledge Gaps
- **243 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+238 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `Planos.tsx`, `button.tsx`, `App.tsx`, `sidebar.tsx`, `hooks/use-toast.ts`, `utils.ts`, `pagination.tsx`, `form.tsx`, `carousel.tsx`, `chart.tsx`, `command.tsx`, `sheet.tsx`, `table.tsx`, `breadcrumb.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `select.tsx`, `toggle-group.tsx`, `FAQSection.tsx`, `alert.tsx`, `input-otp.tsx`, `avatar.tsx`?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `class-variance-authority`, `clsx`, `date-fns`, `embla-carousel-react`, `framer-motion`, `@hookform/resolvers`, `input-otp`, `lucide-react`, `next-themes`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `react`, `react-day-picker`, `react-dom`, `react-hook-form`, `react-router-dom`, `recharts`, `sonner`, `@supabase/supabase-js`, `tailwind-merge`, `tailwindcss-animate`, `@tanstack/react-query`, `vaul`, `zod`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Button` connect `button.tsx` to `Planos.tsx`, `App.tsx`, `cn`, `sidebar.tsx`, `pagination.tsx`, `carousel.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _243 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Planos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07801418439716312 - nodes in this community are weakly interconnected._
- **Should `button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08792270531400966 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08305647840531562 - nodes in this community are weakly interconnected._