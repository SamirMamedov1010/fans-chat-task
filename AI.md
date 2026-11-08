# AI usage

## Tools used

- **OpenAI Codex** for code scaffolding, implementation suggestions, debugging, refactoring.
- **Expo/React Native tooling** (`expo lint`, TypeScript, Expo Doctor) to validate generated and edited code against the actual SDK 57 project.
- **Jest** to verify idempotent sends, restart recovery, purchase confirmation, bulk messages, thread isolation, and the repeatable pagination benchmark.

AI output was treated as a draft and checked against the running application, TypeScript, lint, and focused tests before being retained.

## Examples checked or corrected

- Corrected an initial shared chat engine that made every fan show the same conversation. Engines and persisted client/server keys are now scoped by stable `threadId`, with a regression test for isolation.
- Corrected the lost-response flow so retry reuses a stable client ID and the mock server returns its already accepted message instead of inserting a duplicate.
- Corrected provider placement after runtime errors showed `useToast` and `usePurchases` were being called outside their providers.
- Corrected bulk-recipient counting: selecting a suite plus one of its members now expands and deduplicates the actual users before opening the separate-message screen.
- Corrected chat-list placeholders so every row reads the newest persisted direct or bulk message for that recipient.
- Corrected media/gift ordering and media attachment preview behavior after testing the interactions in the iOS simulator.
- Adjusted oversized bottom-sheet snap points and dismissal behavior after comparing simulator screenshots with the supplied design.

## Remaining uncertainty

- iOS was exercised on an iPhone 17 Pro Max simulator running iOS 26.0; Android was not runtime-tested.
- Simulator/debug memory measurements do not establish release performance on a physical phone.
- Purchases, backend confirmation, incoming delivery, and media upload are local mocks. Production StoreKit/Google Play validation, server notifications, expiry/refund handling, resumable uploads, authentication, and multi-device synchronization are not implemented.
- Exact typography and shadow rendering can vary between iOS and Android and should receive a final physical-device design pass.
