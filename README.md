# FanSuite chat task

Expo SDK 57 / React Native / TypeScript implementation of a durable fan chat, simulated paid access, consumable gifts, media attachments, and repeatable failure controls.

## Run

Requirements: Node 22+, npm, Xcode for iOS or Android Studio for Android.

```bash
npm install
npx expo start
```

Press `i` for iOS or `a` for Android. The implementation was exercised in Expo Go on **iPhone 17 Pro Max Simulator, iOS 26.0**. Android uses the same Expo Router routes and React Native components, but was not runtime-tested for this submission. If using a dependency set not bundled in Expo Go, create a development build with `npx expo run:ios` / `npx expo run:android` or EAS.

Quality commands:

```bash
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Libraries and why they are used

- **Expo SDK 57 + React Native + TypeScript** — cross-platform application foundation with typed domain models and SDK-compatible native modules.
- **Expo Router** — file-based navigation between the chat list, individual fan chats, and separate bulk-message flow. Route parameters carry stable user IDs rather than duplicating screen state.
- **AsyncStorage** — persistence for pending sends, cached messages, mock-server accepted IDs, billing receipts, backend entitlements, and bulk-message records. Client and mock-backend stores use separate keys so an app restart can be simulated realistically.
- **FlashList** — virtualized rendering and pagination for the repeatable 50,000-message history without mounting the whole conversation.
- **React Native Reanimated** — scroll-linked header transitions and lightweight UI animation that stays off the React render path where possible.
- **@gorhom/bottom-sheet** — native-feeling modal sheets with gestures, backdrop handling, safe-area behavior, and controlled snap points.
- **react-native-keyboard-controller** and `KeyboardAvoidingView` — keyboard-safe composer and modal input behavior.
- **react-native-svg** — reusable design icons that remain sharp and can receive component props.
- **expo-image-picker**, **expo-file-system**, and **expo-image** — selecting, durably copying, previewing, and rendering media attachments.
- **react-native-safe-area-context** and **react-native-gesture-handler** — correct notched-device layout and gesture infrastructure.
- **Jest / jest-expo** — focused regression and data-layer performance tests.

## Component and UI architecture

The UI is split into small reusable components rather than being implemented inside route files. Expo Router files only select screens; feature screens compose shared building blocks such as `CustomHeader`, `IconButton`, `CustomButton`, `CustomInput`, `Avatar`, `ChatListItem`, `ChatHeader`, `ChatMessageBubble`, `MessageComposer`, `ChatsInputSection`, and `CustomTabBar`. SVG icons are also isolated components.

This structure keeps visual tokens and interaction states consistent, makes individual pieces easier to test or replace, and prevents the chat list, individual chat, and modal flows from accumulating unrelated logic. Domain behavior is kept outside the UI in `ChatEngine`, mock chat/purchase services, contexts, and typed feature models. Each fan conversation is addressed by `threadId`, so reuse of the same visual components does not imply reuse of message state.

Notable interaction details include:

- the Chats header fades/collapses while scrolling, while the search/filter section remains sticky;
- pending, sending, failed, and confirmed messages transition without replacing their stable row identity;
- message rows use stable keys and visible-content preservation to avoid jumps during pagination and repeated server responses;
- emoji shortcuts append directly to the controlled message input;
- selected media appears as a removable composer preview before sending;
- toast transitions respect the reduced-motion setting;
- buttons expose pressed, disabled, purchasing, pending-confirmation, and retry states;
- safe areas, keyboard avoidance, accessible labels, and sufficiently large press targets are included throughout.

## Bottom-sheet system

All modal experiences are coordinated by one `BottomSheetProvider` and one reusable `BottomSheetWrapper`. Feature code opens a typed sheet (`newMessage`, `fanDetails`, `messageActions`, `giftStore`, `paywall`, or `chatDebug`) and may pass only the data/callbacks that sheet needs. The provider owns presentation, dismissal, snap points, backdrop behavior, and switching from one sheet to another.

This is preferable to mounting an unrelated modal implementation in every screen because it:

- produces consistent gestures, corner radius, backdrop, safe-area spacing, and dismissal behavior;
- prevents several sheets from competing on screen at the same time;
- supports queued transitions such as **message actions → gift store** after the first sheet closes;
- keeps provider-dependent hooks such as purchases and toast feedback in the correct React tree;
- lets each flow choose a compact content-appropriate snap point instead of leaving large empty areas;
- centralizes future accessibility, keyboard, and Android behavior fixes.

The New Message and Fan Details sheets use taller, scrollable layouts because their content can grow. Compact action, gift, and paywall sheets use smaller snap points; successful subscription/backend confirmation and confirmed gift sends dismiss their sheet automatically. The underlying chat remains mounted, so opening a sheet does not discard the draft, scroll position, or restored conversation state.

## Walkthrough and failure controls

Open **Chats**, tap any conversation, then use the vertical three-dot button:

- toggle the mock connection offline/online;
- make the next send lose its response or fail temporarily;
- simulate four incoming messages;
- generate the deterministic 50,000-message history;
- reset chat/server state or all simulated purchases.
- reset only mock-backend access while preserving the simulated store receipt, so Restore can be demonstrated without charging again.

Sending is a paid feature. Tap **Subscribe to send messages** to open the paywall. Billing and backend confirmation are intentionally separate. `success`, `cancelled`, and `failed` choose the next simulated store outcome; **Delay backend confirmation** leaves a successful payment pending; **Confirm pending** grants access. Restore replays persisted receipts idempotently.

The composer `+` opens two actions:

- **Photo or video** opens the platform media picker and copies the selection to `Paths.document/chat-media` before it can enter the durable queue.
- **Send a gift** opens one-time simulated consumables ($5, $25, $50). A gift bubble appears only after backend confirmation. Replaying the same receipt cannot create a second gift.

Toast feedback is used for transient global events; durable message state remains visible inline so a disappearing toast never hides a failure. Failed recoverable messages preserve their text/media and expose **Retry**. Paid-access failures explain that a subscription is required.

## Message safety design

There are two separately persisted stores:

1. The client queue/cache/meta (`chat-client:*`) contains queued sends, a stable installation ID, a monotonic local sequence, and the sync cursor.
2. The mock server (`mock-backend:chat:<threadId>`) contains accepted messages and the `clientId -> serverId` idempotency map. Each fan has an isolated thread; the Chats screen derives its preview and ordering from that fan's latest persisted message instead of placeholder copy.

`ChatEngine.send` creates `installId:localSequence`, persists the queued record first, and only then exposes it as queued. Retries and restarts reuse that client ID. The server checks the accepted-ID map before authorization or injected failure handling and returns the existing server message. This fixes the classic sequence:

1. server accepts a send;
2. response is lost;
3. client retries;
4. a naive backend inserts a duplicate.

The focused regression test injects exactly that lost-response case and asserts one server message. The restart test creates three offline sends, constructs a fresh engine over the same storage, verifies they are still queued, recovers four incoming messages, reconnects, and verifies seven unique final records. Confirmed ordering comes from `serverSequence`; local queued order remains monotonic until confirmation.

## Purchase/access design

`MockPurchaseService` represents the store and persists receipts under `mock-billing:receipts`. `MockPurchaseBackend` independently validates/records events under `mock-backend:purchases`. Access is granted only by a non-expired backend entitlement—not by a successful UI purchase result. Processed event IDs make subscription and consumable events idempotent. A failed unrelated purchase never clears an existing entitlement.

In production I would replace the mock store with StoreKit / Google Play Billing (normally through a maintained purchases SDK), send the signed transaction/token to the backend, verify it with the store server APIs, and make backend entitlement state authoritative. Store server notifications would handle renewals, expiry, grace periods, revocations, refunds, and chargebacks; the client would refresh entitlements on launch, foreground, purchase, and restore.

## 50,000-message performance

The service represents deterministic seeded history in O(1) persisted state and materializes only requested pages. `FlashList` renders a 50-message page with stable keys and `maintainVisibleContentPosition`; pagination prepends older pages while pending outgoing items remain stable. Bubble rendering is memoized and the composer state is outside list rows.

Repeatable data-layer benchmark on the same 50,000-message history (Jest, Node 22.17, this machine):

| Strategy | Materialized records | JSON payload | Generation time |
|---|---:|---:|---:|
| Eager baseline | 50,000 | 7,427,789 characters | 6 ms |
| Paginated | 50 | 7,452 characters | <1 ms |

This isolates the bottleneck found in the initial approach: eagerly retaining the entire history, rather than row drawing itself. The paginated payload is under 0.11% of the eager payload.

Runtime evidence was collected in **Expo Go development mode** on the iPhone 17 Pro Max / iOS 26.0 simulator. The `?profileHistory=50000` route loaded the latest page from the 50,000-message history and the Expo Go process reported **86,304 KB RSS** after settling. This is a simulator/debug-host measurement, not proof of real-device or release performance. Instruments' Animation Hitches template reported that hitch collection is unsupported for this simulator platform, so no frame or dropped-frame number is claimed. A release build on a physical device should be profiled with Instruments (iOS) or Perfetto/Android Studio using the same generate → repeated scroll → type sequence.

Reduced-motion is respected by transient toast animation. Keyboard avoidance, safe areas, accessible roles/labels, offline state, pending/sending/failed statuses, and stable retry actions are included.

## Test evidence

Latest local run:

```text
Test Suites: 4 passed, 4 total
Tests:       11 passed, 11 total
```

Covered cases:

- accepted send + lost response + retry produces one message;
- separate fan conversations cannot leak messages into each other;
- three pending sends survive a fresh engine/app instance;
- four offline incoming messages are recovered before queue drain;
- delayed confirmation does not grant access early;
- a persisted store receipt restores access after backend state is cleared;
- resetting one conversation removes its separate-message records without affecting other recipients;
- an explicitly reset conversation stays empty after app restart and reconnect instead of recreating demo seed messages;
- repeated consumable confirmation creates one gift;
- 50,000-message eager versus paginated payload regression.

## Scope notes

This remains a local mock: there is no real account, backend, StoreKit/Play purchase, upload service, or remote media URL. Selected media is durable on the current device and is suitable for exercising the offline queue; a production implementation would upload it with resumable transfer and persist an upload state machine before submitting the chat message.

`npm audit --omit=dev` currently reports 14 moderate transitive advisories in the Expo/Expo Router toolchain. Its proposed forced fix downgrades Expo/Expo Router across incompatible major versions, so it was intentionally not applied. Expo Doctor passes all 21 checks with the SDK-compatible dependency set.

## Time spent

Approximately **6–7 hours** including Expo setup, Figma-based UI work, mock chat and purchase services, failure-state debugging, automated tests, performance measurement, and documentation. The time limit was prioritized toward correctness of durable/idempotent sends, paid-access state, per-fan thread isolation, and a working mobile flow; real store/backend integration and physical-device profiling remain intentionally out of scope.
