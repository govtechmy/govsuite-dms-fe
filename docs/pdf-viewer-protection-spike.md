# PDF Viewer Protection — Spike

|                  |                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Type**         | Spike, with a proof of concept (POC) to demo the findings                                                                 |
| **Status**       | In progress. Interim measure merged in [PR #139](https://github.com/govtechmy/govsuite-dms-fe/pull/139) (govsuitedms-690) |
| **Scope**        | Document viewer in `govsuite-dms-fe` (`PdfJsDocumentViewer`)                                                              |
| **Covers**       | R2 (screenshot → black) and R3 (screen recording → black)                                                                 |
| **Last updated** | 2026-11-26                                                                                                                |

---

## 1. Requirements

| ID  | Requirement                                                                                     |
| --- | ----------------------------------------------------------------------------------------------- |
| R1  | Users can copy text from the displayed PDF.                                                     |
| R2  | When a user tries to take a screenshot (Print Screen), the PDF area shows a black screen.       |
| R3  | When a user tries to record the screen, the PDF area shows a black screen.                      |
| R4  | The displayed PDF cannot be downloaded directly from the browser, only via the Download button. |
| R5  | Every PDF must be watermarked.                                                                  |

These requirements are the starting point for this spike. **The spike covers R2 and R3.** Any solution must not break R1. R4 and R5 are handled separately.

### Constraints

- **No paid licences.** Everything is built in-house and runs internally (air-gapped).
- **Platforms:** mostly Chrome; some users on Linux or macOS.

---

## 2. Interim implementation (PR #139)

[PR #139](https://github.com/govtechmy/govsuite-dms-fe/pull/139) wraps the viewer in a `CaptureGuard` that blacks out the PDF when the browser loses focus or sees certain keys.

**This is a stop-gap, not a solution.** It works like patching a leaky bucket: it reacts to signals that _usually_ come with a capture (focus loss, key presses) instead of stopping the capture itself. Every capture tool that doesn't produce one of those signals gets through, and each new hole needs another patch. Section 2.2 lists the holes.

It is what we can ship and extend **until the spike (§3) finds a way to meet R2 and R3 properly**.

It is also the **POC we show to people**: run the test cases in §2.2 live to demo what is blocked and what still gets through.

### 2.1 What PR #139 does

`src/components/shared/PdfJsDocumentViewer.tsx` renders the PDF with `react-pdf` (pdf.js), including a text layer, so R1 holds.

The viewer is wrapped in `src/components/shared/CaptureGuard.tsx` (govsuitedms-690). It swaps the content for a black panel ("Dokumen disembunyikan untuk keselamatan. Klik untuk paparkan semula.") when:

| Trigger            | Mechanism                                                                | Requirement |
| ------------------ | ------------------------------------------------------------------------ | ----------- |
| Window loses focus | `window` `blur` (e.g. a snipping overlay or capture app takes focus)     | R2, R3      |
| Tab hidden         | `visibilitychange`                                                       | R2, R3      |
| PrintScreen        | `keyup` → blackout for 1.5s + clipboard overwritten with an empty string | R2          |
| Print              | `print:hidden` CSS; Ctrl/Cmd+P blocked                                   | —           |
| Save               | Ctrl/Cmd+S blocked                                                       | —           |
| Right-click        | Context menu blocked on the viewer                                       | —           |

Design notes:

- **Fails closed.** It starts hidden and reveals only once focus is confirmed.
- Toggled straight on the DOM (`data-capture-hidden`), not through React state, so the blackout paints as early as possible.
- Uses `visibility: hidden`, so layout, scroll position and page tracking are kept.

### 2.2 Coverage of PR #139 (before §2.3)

Each case starts with a document open in the viewer and the browser window focused. **Expected** is what the requirement asks for. **Current** is the result predicted by reading `CaptureGuard`'s code. **Actual** is the result from testing on real machines.

Legend: ✅ Covered · ⚠️ Partial · ❌ Not covered · ❓ Unknown until tested

#### Screenshot (R2)

| ID    | Platform      | Steps                                                                          | Expected                | Current                                                                                 | Actual |
| ----- | ------------- | ------------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------- | ------ |
| TC-01 | Windows       | Press **PrintScreen** (set to copy full screen to clipboard / save to file)    | Capture shows black PDF | ❌ Captured. `keyup` arrives after the capture; blackout only applies afterwards.       |        |
| TC-02 | Windows 11    | Press **PrintScreen** (default: opens the Snipping overlay) and select an area | Capture shows black PDF | ❓ Depends on whether the overlay freezes the frame before the browser gets `blur`.     |        |
| TC-03 | Windows       | Press **Win+Shift+S** and select an area                                       | Capture shows black PDF | ❓ Same race as TC-02.                                                                  |        |
| TC-04 | Windows       | Open the **Snipping Tool app**, click New (with or without a delay)            | Capture shows black PDF | ✅ Browser loses focus when the app is clicked, so the PDF is black during the capture. |        |
| TC-05 | Windows       | Press the hotkey of a **third-party tool** (Greenshot, Lightshot, ShareX)      | Capture shows black PDF | ❌ Global hotkey captures without taking focus first.                                   |        |
| TC-06 | macOS         | Press **Cmd+Shift+3** (full screen)                                            | Capture shows black PDF | ❌ Instant capture; no focus change.                                                    |        |
| TC-07 | macOS         | Press **Cmd+Shift+4** and select an area                                       | Capture shows black PDF | ❌ Crosshair doesn't take focus from the browser.                                       |        |
| TC-08 | macOS         | Press **Cmd+Shift+5**, then capture                                            | Capture shows black PDF | ⚠️ Black only if the toolbar takes focus before the capture.                            |        |
| TC-09 | Linux (GNOME) | Press **PrintScreen** (interactive screenshot UI) and capture                  | Capture shows black PDF | ❓ Depends on whether the screenshot UI takes focus before freezing the frame.          |        |

#### Screen recording (R3)

| ID    | Platform   | Steps                                                                                           | Expected                    | Current                                                                                | Actual |
| ----- | ---------- | ----------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------- | ------ |
| TC-10 | Any        | Start **OBS** (or another recorder) recording, then switch back to the browser and read the PDF | Recording shows black PDF   | ⚠️ Black only while OBS has focus. Fully visible once the user returns to the browser. |        |
| TC-11 | Any        | Start the recorder **before** opening the document, then open and read it                       | Recording shows black PDF   | ❌ No focus change happens, so the PDF is recorded.                                    |        |
| TC-12 | Windows    | Press **Win+Alt+R** (Xbox Game Bar quick record)                                                | Recording shows black PDF   | ❌ Recording starts without the browser losing focus.                                  |        |
| TC-13 | Windows    | Press **Win+G**, start recording from the Game Bar overlay, close the overlay                   | Recording shows black PDF   | ⚠️ Black while the overlay is open. Visible after it closes.                           |        |
| TC-14 | Windows 11 | Record with the **Snipping Tool** video mode, then return to the browser                        | Recording shows black PDF   | ⚠️ Same as TC-10.                                                                      |        |
| TC-15 | macOS      | **Cmd+Shift+5** → Record, or QuickTime → New Screen Recording, then return to the browser       | Recording shows black PDF   | ⚠️ Same as TC-10.                                                                      |        |
| TC-16 | Any        | Share the **browser tab or window** in Teams / Google Meet and read the PDF                     | Shared view shows black PDF | ❌ No signal that the tab is being shared.                                             |        |

#### Related behaviour

| ID    | Requirement | Steps                                                    | Expected                                   | Current                                                     | Actual |
| ----- | ----------- | -------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- | ------ |
| TC-17 | R2, R3      | Switch to another tab, or minimise the browser           | PDF hidden while away                      | ✅ `visibilitychange` / `blur` hide it.                     |        |
| TC-18 | R2, R3      | Click into another app, then click back on the viewer    | PDF black while away, shown again on click | ✅ Black on `blur`, back on `focus`.                        |        |
| TC-19 | R2, R3      | Open the document while the browser window isn't focused | PDF stays black until the user clicks in   | ✅ Fails closed.                                            |        |
| TC-20 | —           | Press **Ctrl/Cmd+P**, or print from the browser menu     | Nothing printed                            | ✅ Shortcut blocked; `print:hidden` blanks the printout.    |        |
| TC-21 | —           | Press **Ctrl/Cmd+S**                                     | Save dialog doesn't open                   | ✅ Shortcut blocked.                                        |        |
| TC-22 | —           | Right-click on the PDF                                   | No context menu                            | ✅ Blocked.                                                 |        |
| TC-23 | R1          | Select text in the PDF and copy it (Ctrl/Cmd+C)          | Text is copied                             | ✅ pdf.js text layer; `CaptureGuard` doesn't block copying. |        |
| TC-24 | R2, R3      | Photograph or film the screen with a phone               | —                                          | ❌ Can't be covered by software.                            |        |

#### Not covered

| What                                                                                         | Test cases       | Why                                                                                 | Addressed by                                                                    |
| -------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| PrintScreen straight to clipboard / file                                                     | TC-01            | The browser gets the key event only after the OS has captured the screen.           | Only DRM (§3.1)                                                                 |
| Shortcut-based screenshot overlays (Win+Shift+S, Win 11 PrintScreen, Cmd+Shift+3/4/5, GNOME) | TC-02, 03, 06–09 | The blackout depends on a focus change, which happens too late or not at all.       | Capture-shortcut blackout (§2.3 #1); see §2.4                                   |
| Third-party screenshot tool hotkeys                                                          | TC-05            | Global hotkey, no focus change.                                                     | Capture-shortcut blackout if the hotkey uses Cmd+Shift / Ctrl+Shift / Win / Alt |
| Recordings and screen shares running while the user reads in the tab                         | TC-10–16         | Once the browser has focus again there's no signal that a recording is in progress. | Idle blackout (§2.3 #4) only catches unattended ones; DRM blocks it             |
| Phone camera                                                                                 | TC-24            | Outside the computer.                                                               | Not solvable by the viewer (traceable via R5)                                   |

### 2.3 Further interim measures (extend `CaptureGuard`)

More patches on top of PR #139. They plug more holes for the screenshot tools civil servants actually use, but the approach stays the same, so the bucket still leaks.

**Implemented:**

| #   | Change                                                                                                                                                                                                      | Defeats                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Capture-shortcut blackout:** black out the moment the start of a capture shortcut is held: any two or more modifiers on every platform; Ctrl or Option alone on macOS; Win or Alt alone on Windows/Linux. | Cmd+Shift+3/4/5/6, Win+Shift+S, Win+PrtScn, Alt+PrtScn, Win+Alt+PrtScn, Win+G, Win+Alt+R, third-party and custom hotkeys that use these modifiers (§2.4) |
| 2   | **Click to reveal:** after focus loss, a capture shortcut or PrintScreen, the PDF stays black until the user clicks or presses a key in the page (no automatic reveal when focus comes back).               | Area selection that takes a few seconds (Cmd+Shift+4), timed / delayed captures (Cmd+Shift+5 timer, Snipping Tool delay)                                 |
| 3   | **Pointer-leave blackout:** black out while the mouse is outside the page; shown again when it returns.                                                                                                     | Clicking a menu-bar or system-tray capture app, a browser extension button, or moving to another monitor                                                 |
| 4   | **Idle blackout:** black out after 30s with no mouse, touch, scroll or keyboard input; any input brings it back.                                                                                            | Unattended recordings or timed captures left running on an open document                                                                                 |

How it works: the browser receives modifier keydowns (Cmd, Win, Alt/Option, Shift, Ctrl) **before** the OS takes the final key (3, 4, S, PrtScn), so the page is already black when the capture happens. Three single modifiers are deliberately **not** treated as capture shortcuts: Shift (typing), Cmd on macOS and Ctrl on Windows/Linux (copy, R1). Option alone is ignored while typing in a text field on macOS.

Side effects (by design): any shortcut with these modifiers (e.g. Cmd+Shift+T, Alt+Left) also blacks out the PDF until the next click, and so does parking the mouse outside the browser window.

**Rejected:** spotlight mode (only a strip around the cursor readable), because it conflicts with the GovSuite UI requirements (§3.3.6).

### 2.4 Screenshot edge cases (macOS and Windows)

Every known way a user can screenshot the viewer, and whether the browser can block it after §2.3. **Expected** is predicted from how the browser and OS behave; **Actual** is the result from testing on real machines.

Legend: ✅ Black · ⚠️ Partly · ❌ Not blocked · ❓ Unknown until tested

#### macOS

| ID   | Method                                                                                                  | Browser signal                                  | Expected                                   | Actual |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ | ------ |
| M-01 | Cmd+Shift+3 (full screen to file)                                                                       | Cmd+Shift held                                  | ✅                                         |        |
| M-02 | Cmd+Ctrl+Shift+3 (full screen to clipboard)                                                             | Cmd+Shift held                                  | ✅                                         |        |
| M-03 | Cmd+Shift+4, drag an area                                                                               | Cmd+Shift held, stays black until click         | ✅                                         |        |
| M-04 | Cmd+Ctrl+Shift+4 (area to clipboard)                                                                    | Cmd+Shift held                                  | ✅                                         |        |
| M-05 | Cmd+Shift+4, then Space (capture a window)                                                              | Cmd+Shift held                                  | ✅                                         |        |
| M-06 | Cmd+Shift+5 toolbar (screenshot)                                                                        | Cmd+Shift held + focus loss                     | ✅                                         |        |
| M-07 | Cmd+Shift+5 with 5s / 10s timer                                                                         | Stays black until click                         | ✅                                         |        |
| M-08 | Cmd+Shift+6 (Touch Bar capture)                                                                         | Cmd+Shift held                                  | ✅                                         |        |
| M-09 | Screenshot app opened from Spotlight, Launchpad or Dock; Preview → File → Take Screenshot               | Focus loss                                      | ✅                                         |        |
| M-10 | `screencapture` from Terminal, including with a delay (`-T 10`)                                         | Focus loss, stays black until click             | ✅                                         |        |
| M-11 | Third-party tool on a Cmd+Shift or Ctrl+Shift hotkey (CleanShot X, Shottr, Snagit defaults)             | Modifiers held                                  | ✅                                         |        |
| M-12 | Third-party tool clicked from the menu bar                                                              | Pointer leaves page, maybe focus loss           | ❓ Depends on whether the tool takes focus |        |
| M-13 | Third-party tool on a custom hotkey using Ctrl, Option or two+ modifiers (e.g. Option+1, Ctrl+Option+S) | Modifiers held                                  | ✅                                         |        |
| M-14 | Dedicated screenshot key or macro that sends all keys at once (Logitech, Stream Deck, BetterTouchTool)  | Modifiers arrive with the final key             | ❓ Race; likely ❌                         |        |
| M-15 | Browser extension clicked from the toolbar                                                              | Pointer leaves page + focus loss                | ✅                                         |        |
| M-16 | Browser extension keyboard shortcut                                                                     | Modifiers held                                  | ✅                                         |        |
| M-17 | DevTools → "Capture screenshot" / "Capture full size screenshot"                                        | Focus moves to DevTools                         | ❓                                         |        |
| M-18 | Screen sharing / remote control (Teams, Zoom, Screen Sharing, AnyDesk); remote side captures            | None                                            | ❌                                         |        |
| M-19 | Third-party tool on a hotkey with no modifier, Shift only or Cmd only (e.g. F-key, Cmd+1)               | None, or modifier is excluded for typing / copy | ❌                                         |        |
| M-20 | Chrome "Search with Google Lens" (takes a screenshot of the tab)                                        | Pointer leaves page to click it                 | ❓                                         |        |
| M-21 | Phone camera                                                                                            | None                                            | ❌                                         |        |

#### Windows

| ID   | Method                                                                                               | Browser signal                                                       | Expected                                 | Actual |
| ---- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- | ------ |
| W-01 | PrtScn / Fn+PrtScn (full screen to clipboard; classic setting)                                       | `keyup` only, after the capture                                      | ❌                                       |        |
| W-02 | PrtScn on Windows 11 (opens the Snipping overlay, the default)                                       | Focus loss, but the overlay may freeze first                         | ❓ Race                                  |        |
| W-03 | Alt+PrtScn (active window to clipboard)                                                              | Alt held                                                             | ✅                                       |        |
| W-04 | Win+PrtScn (full screen to Pictures)                                                                 | Win held                                                             | ✅                                       |        |
| W-05 | Win+Shift+S (Snipping Tool)                                                                          | Win held + focus loss                                                | ✅                                       |        |
| W-06 | Win+Alt+PrtScn (Game Bar screenshot)                                                                 | Win held                                                             | ✅                                       |        |
| W-07 | Win+G (Game Bar overlay)                                                                             | Win held + focus loss                                                | ✅                                       |        |
| W-08 | Snipping Tool app opened from Start / taskbar                                                        | Focus loss                                                           | ✅                                       |        |
| W-09 | Snipping Tool with a 3s / 5s / 10s delay                                                             | Stays black until click                                              | ✅                                       |        |
| W-10 | Shift+PrtScn or Ctrl+PrtScn (third-party tool variants)                                              | Shift alone / Ctrl alone are not treated as capture (copy must work) | ❌                                       |        |
| W-11 | Third-party tool on PrtScn (Greenshot, Lightshot, ShareX defaults)                                   | `keyup` only, after the capture                                      | ❌                                       |        |
| W-12 | Third-party tool on a hotkey using Win, Alt or two+ modifiers (e.g. Snagit Ctrl+Shift+C, Ctrl+Alt+S) | Modifiers held                                                       | ✅                                       |        |
| W-13 | Third-party tool clicked from the system tray                                                        | Pointer leaves page + focus loss                                     | ✅                                       |        |
| W-14 | Win+Volume Down / pen button (Surface and tablets)                                                   | Unknown                                                              | ❓                                       |        |
| W-15 | Edge Web capture (Ctrl+Shift+S)                                                                      | Ctrl+Shift held                                                      | ✅ at start; ❓ during area selection    |        |
| W-16 | Browser extension clicked from the toolbar, or its shortcut (Alt+…, Ctrl+Shift+…)                    | Pointer leaves page / modifiers held                                 | ✅ (❌ if the shortcut is Ctrl+key only) |        |
| W-17 | DevTools → "Capture screenshot"                                                                      | Focus moves to DevTools                                              | ❓                                       |        |
| W-18 | Windows Recall (Copilot+ PCs) taking periodic snapshots                                              | None                                                                 | ❌                                       |        |
| W-19 | Remote Desktop / Teams / AnyDesk; remote side captures                                               | None                                                                 | ❌                                       |        |
| W-20 | Third-party tool on a hotkey with no modifier, Shift only or Ctrl only (e.g. F-key, Ctrl+Q)          | None, or modifier is excluded for typing / copy                      | ❌                                       |        |
| W-21 | Chrome "Search with Google Lens" (takes a screenshot of the tab)                                     | Pointer leaves page to click it                                      | ❓                                       |        |
| W-22 | Phone camera                                                                                         | None                                                                 | ❌                                       |        |

#### Browser signals used

Everything the browser exposes that can come before or during a screenshot is now used:

| Signal                                                | Used for                                             |
| ----------------------------------------------------- | ---------------------------------------------------- |
| Modifier `keydown` (Ctrl, Alt/Option, Cmd/Win, Shift) | Capture-shortcut blackout                            |
| `PrintScreen` `keydown` / `keyup`                     | Blackout (+ clipboard cleared); too late on Windows  |
| `blur`, `visibilitychange`                            | Blackout when another app, overlay or tab takes over |
| `mouseleave` / `mouseenter` on the page               | Blackout while the mouse is outside the page         |
| `pointerdown` / non-modifier `keydown`                | The only way to reveal again (click to reveal)       |
| `print` media, Ctrl/Cmd+P, Ctrl/Cmd+S, `contextmenu`  | Print blanked, save / print / right-click blocked    |

Signals considered and not used:

- **Clipboard read after focus returns** (to detect a copied screenshot): needs a permission prompt, and the capture has already happened.
- **DevTools-open detection**: unreliable heuristics, and `blur` already fires when DevTools takes focus.

#### Not covered at browser level

These are outside what a web page can see or control:

| What                                                                                                       | IDs                                            | Why                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| PrintScreen on its own, and tools bound to it (Greenshot, Lightshot, ShareX)                               | W-01, W-11                                     | The OS takes the key first; the browser only gets `keyup`, after the capture.                                   |
| Hotkeys with no modifier (F-keys, single keys)                                                             | M-19, W-20                                     | Global hotkeys are consumed by the OS; the browser gets no event at all.                                        |
| Hotkeys whose only modifier is Shift, Cmd (macOS) or Ctrl (Windows/Linux), incl. Shift+PrtScn, Ctrl+PrtScn | M-19, W-10, W-16, W-20                         | Treating these as capture would black out the PDF on every capital letter and every Cmd+C / Ctrl+C (breaks R1). |
| Macros and dedicated screenshot keys that send all keys at once                                            | M-14                                           | The modifiers and the final key arrive together, so there's no time to black out first.                         |
| Background and remote capture: Windows Recall, remote desktop, screen sharing                              | M-18, W-18, W-19                               | Nothing happens in the browser.                                                                                 |
| Phone camera                                                                                               | M-21, W-22                                     | Outside the computer.                                                                                           |
| Unknown until tested                                                                                       | M-12, M-17, M-20, W-02, W-14, W-15, W-17, W-21 | Depends on OS / tool timing.                                                                                    |

---

## 3. Spike: solving R2 and R3 properly

The interim measures can only react to signals the browser sees. The spike looks for a way to make the PDF **actually** render black in captures, while keeping R1.

### 3.1 DRM (Encrypted Media Extensions)

#### How it works

Browsers can only make content black in captures when it is **DRM-protected video** decoded through a **hardware-secure path**. The OS compositor refuses to hand those frames to screenshot and recording tools, so they come out black. Nothing else in the browser (CSS, canvas, WebGL) gets this treatment.

To use it for PDFs:

1. **Server:** render each PDF page to an image (dataproc already renders pages).
2. **Server:** encode the pages as a short video, one frame per page (H.264/MP4).
3. **Server:** encrypt it with CENC using **Shaka Packager** (open source).
4. **Licence server:** issues decryption keys to the browser's Content Decryption Module (CDM), with a policy that **requires hardware-secure decoding**. Without that policy, the browser falls back to a software CDM, which can be captured.
5. **Client:** **Shaka Player** (open source) plays the video in a `<video>` element via EME. The viewer shows one frame (page) at a time.
6. **R1 (copy text):** a video has no text, so an invisible text layer has to be laid over it. See "Problem: DRM conflicts with R1" below.

#### Fit with the pdf.js viewer

**DRM can't be added to the current pdf.js viewer.**

- EME only protects `<video>` and `<audio>` elements. pdf.js draws each page on a `<canvas>`, which is ordinary page content that every screenshot and recording tool captures.
- Protected video can't be routed through a canvas either. The browser blocks drawing DRM video into a canvas, and the result is black or blank.
- So the page image has to come from a `<video>` element instead of pdf.js's canvas. That means a new viewer, not a change to the existing one.

What a DRM viewer would look like (hybrid):

| Layer                                        | Source                                                                                     | In a capture                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Page image                                   | `<video>` playing the DRM-encrypted page (one frame per page)                              | Black, on hardware-DRM machines only       |
| Text layer (copy text, search, highlighting) | pdf.js loading a **text-only PDF** made by the server (invisible text, no images/graphics) | Invisible text; highlights show over black |

Problems specific to replacing pdf.js's page drawing:

1. **Too many video elements:** continuous scroll needs one `<video>` per page. Hardware decoders allow only a few protected streams at once, so only the visible pages could be loaded. The page list would need to be rewritten as a virtualised list.
2. **Zoom:** a video frame is a fixed-resolution image, so zooming in blurs it. Sharp zoom needs several pre-rendered resolutions per page, which multiplies server processing and storage.
3. **Slower page loads:** each page needs a licence request and video setup, which is slower than drawing on a canvas.
4. **Hardware fallback:** on machines without hardware DRM, the video either falls back to software DRM (captured) or refuses to play, depending on the licence policy.

#### Problem: DRM conflicts with R1 (copy text)

**DRM conflicts with R1.** A video frame is only pixels, so users can't select or copy text from a DRM page.

The only workaround is the invisible text overlay described above. It doesn't remove the conflict, it works around it: the overlay puts the full text back in the page as plain, unprotected content. The more R1 is supported, the less DRM protects, because anyone can select all, copy, and paste the whole document. The overlay also has these problems:

| Problem                       | Detail                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Alignment                     | The invisible text has to line up exactly with the text in the video frame at every zoom level. Any drift means the user selects the wrong words, or the selection highlight doesn't match the visible text. |
| Scanned PDFs                  | Scanned documents have no text, so the overlay depends on OCR (Tesseract in dataproc). Selection and copy are only as accurate as the OCR.                                                                   |
| Second file per document      | The server has to make a text-only PDF (or a text-position file) for every document, on top of the encrypted video.                                                                                          |
| Copied text isn't protected   | Everything in the text layer sits in the page as plain text. A user can select all, copy and paste the whole document; DRM only protects the pixels.                                                         |
| Formatting lost               | Copy gives plain text only. Tables, images and layout in the video can't be copied.                                                                                                                          |
| Selection visible in captures | The selection highlight and search highlights are page content, so they show in a capture as coloured boxes over the black video. They don't reveal the text, but they show where it is.                     |

#### Key systems

| Key system                      | Browser / OS                                    | Black in screenshot / recording? | Licence                                                                                               |
| ------------------------------- | ----------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Widevine L1** (hardware)      | Chrome / Edge on **Windows** with supported GPU | ✅ Yes                           | Licence agreement with Google, plus a certified licence server (in practice a paid DRM provider)      |
| **Widevine L3** (software)      | Chrome on **macOS** and **Linux**; Firefox      | ❌ No: frames are capturable     | Same as above                                                                                         |
| **PlayReady SL3000** (hardware) | Edge on **Windows**                             | ✅ Yes                           | Commercial licence from Microsoft                                                                     |
| **FairPlay**                    | Safari on **macOS**                             | ✅ Yes                           | Apple developer programme + FairPlay deployment package; licence server needs certificates from Apple |
| **Clear Key**                   | All EME browsers                                | ❌ No: no output protection      | Free, open source                                                                                     |

_All ✅/❌ entries are from vendor documentation and have not been tested, because DRM was not chosen._

#### Coverage for our users

| Platform                      | Result with DRM                                                 |
| ----------------------------- | --------------------------------------------------------------- |
| Windows + Chrome (main group) | ✅ Black, **only if** the GPU/driver supports Widevine L1       |
| Windows + Edge                | ✅ Black (PlayReady SL3000 or Widevine L1)                      |
| macOS + Chrome                | ❌ Captured (Widevine L3). Users would have to switch to Safari |
| macOS + Safari                | ✅ Black (FairPlay)                                             |
| Linux + any browser           | ❌ Captured (L3 only). No hardware DRM path exists on Linux     |

#### Assessment

| Criterion           | Result                                                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2 / R3             | ✅ True black capture, but **only on Windows (L1/SL3000) and Safari**. Linux and macOS Chrome users are not covered, so the interim measures would still be needed for them.                                          |
| R1                  | ❌ **Conflicts with R1.** A video page can't be selected or copied. The text-overlay workaround puts the text back as unprotected plain text and has alignment and OCR issues (see "Problem: DRM conflicts with R1"). |
| pdf.js viewer       | ❌ Can't be reused for page rendering (canvas isn't protected). A new video-based viewer is needed; pdf.js stays only for the text layer.                                                                             |
| Licence / cost      | ❌ Breaks the **no-paid-licence** constraint: Widevine, PlayReady and FairPlay all need vendor agreements, certificates or a paid DRM provider. Clear Key is free but provides no protection.                         |
| Air-gapped          | ❌ Licence servers need vendor certificates and agreements; clients may need online CDM provisioning. Not proven to work fully offline.                                                                               |
| Effort              | ⚠️ High: page-to-video pipeline, packaging, licence server, a new video-based viewer, and rebuilding search and highlighting on top of it.                                                                            |
| Hardware dependency | ⚠️ L1 depends on each machine's GPU and driver. Older government PCs may silently fall back to L3, which is captured, or be refused playback if L1 is required.                                                       |
| Mobile phone camera | ❌ Not covered (same as the interim measures).                                                                                                                                                                        |

**Verdict: not chosen.** DRM is the only route to a _real_ black capture, but it will not be adopted. Its licences are a recurring cost that would have to be paid for as long as the system runs, and that won't be approved. It also isn't proven offline, can't be added to the pdf.js viewer (it needs a new video-based viewer), conflicts with R1 (copy text), and still leaves Linux and macOS Chrome users unprotected.

### 3.2 Coverage by approach (to verify on real machines)

| Capture method                                     | Requirement | Today                                                              | Interim (PR #139 + §2.3)                          | DRM                           |
| -------------------------------------------------- | ----------- | ------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------- |
| Win+Shift+S                                        | R2          | Depends on overlay focus timing                                    | Black (modifier hold)                             | Black on L1 / SL3000 machines |
| PrintScreen (Win 11 → Snipping overlay)            | R2          | Unverified; depends on focus timing                                | Unverified. Cannot be intercepted before capture. | Black on L1 / SL3000 machines |
| PrintScreen (direct to file / clipboard)           | R2          | Captured                                                           | Captured                                          | Black on L1 / SL3000 machines |
| Cmd+Shift+3/4/5 (macOS)                            | R2          | Depends on focus timing                                            | Black (modifier hold)                             | Black in Safari only          |
| Xbox Game Bar (Win+Alt+R)                          | R3          | Black while the overlay has focus                                  | Black (modifier hold + blur)                      | Black on L1 / SL3000 machines |
| OBS / Snipping Tool video started from another app | R3          | Black while the other app has focus; visible once the user returns | Visible while the user reads; idle blackout only  | Black on L1 / SL3000 machines |
| Teams / Meet / Chrome tab share                    | R3          | Visible                                                            | Visible                                           | Black on L1 / SL3000 machines |
| Any capture on Linux                               | R2, R3      | As above                                                           | As above                                          | Captured (no hardware DRM)    |
| Phone camera                                       | R2, R3      | Visible                                                            | Visible                                           | Visible                       |

### 3.3 Other options considered

#### 3.3.1 Desktop app (Electron or Tauri)

Both frameworks can wrap the existing web app and set the OS "exclude from capture" flag on the window. No licence is needed. They call the same OS APIs, so they cover the same platforms:

| Platform              | Electron `setContentProtection` / Tauri `setContentProtected` | Result in captures                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 10 2004+ / 11 | `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`            | ✅ Window is left out of screenshots and recordings (older Windows 10 shows it black instead)                                                                                                                    |
| macOS                 | `NSWindow.sharingType = .none`                                | ⚠️ Only legacy capture APIs respect it. On **macOS 15+**, apps that use ScreenCaptureKit (OBS, Zoom, Teams and newer recorders) **still capture the window**. Apple says there is no public API to prevent this. |
| Linux                 | ❌ **Not supported** in either framework                      | ❌ Captured. X11 has no such flag, and Wayland has no standard protocol for it.                                                                                                                                  |

Not chosen because:

- **Linux isn't supported by Electron or Tauri**, so Linux users wouldn't be covered.
- **macOS coverage is weak** on macOS 15 and later, because ScreenCaptureKit-based capture ignores the flag. Only Windows gets reliable protection.
- An installer has to be distributed, updated and supported on every user's machine, alongside the web app.
- It's a second client to build and maintain.

#### 3.3.2 Detecting screen recording / screen capture from JavaScript

Doesn't apply because:

- **No browser API reports external capture apps.** `getDisplayMedia` only covers capture the page starts itself, and there's no event when another tab or app captures this one.

#### 3.3.3 Clearing the clipboard after PrintScreen

Kept as a harmless extra in `CaptureGuard`, but **not relied on**:

- `keyup` fires after the capture.
- Most tools (Snipping Tool, macOS screenshots, Greenshot) save straight to a file, so the clipboard doesn't matter.

#### 3.3.4 Disabling text selection / rendering pages as images only

Doesn't apply because:

- **Breaks R1:** users must be able to copy text.
- Image-only pages can still be screenshotted, so they don't solve R2 or R3.

#### 3.3.5 Temporal noise / frame interleaving (flicker trick)

Each page is drawn as two noise frames that alternate at the display refresh rate. The eye blends them into the document; a single screenshot shows only noise.

Doesn't apply because:

- **Visible flicker** and a **photosensitive seizure risk**, which is not acceptable for a government system (accessibility).
- A 60fps recording can be averaged back into the readable document.
- Heavy on CPU/GPU and unreliable on low-end machines.

#### 3.3.6 Spotlight mode (reading lens)

Only a strip of a few lines around the cursor is readable; the rest of the page is blurred or black. A recording or screen share running while the user reads would only capture that strip.

Not chosen because:

- **It conflicts with the GovSuite UI requirements:** users can't see the full page while reading.
- It only makes a full capture tedious (sweep the cursor down every page), not impossible.

### 3.4 Real-world comparison

How products that protect documents in the browser handle screenshots and recording (from vendor documentation, November 2026).

#### Script-based protection in a normal browser (same approach as ours)

| Product                     | What it does                                                                                                    | Their own disclaimer                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Dropbox DocSend, "Standard" | Blacks out the document when the cursor moves off it                                                            | "Can't guarantee that users won't take screenshots, screen recordings, or photos" |
| Dropbox DocSend, "Strict"   | Everything black except a horizontal strip under the cursor (spotlight mode)                                    | Same, and "significantly restricts the viewing experience"                        |
| Digify Screen Shield        | Shows only part of the page with a watermarked filter; blocks "most screenshot shortcuts and plugins"           | "Some system-level methods may not always be preventable"                         |
| Vitrium                     | Blurs the viewer when the browser isn't focused                                                                 | —                                                                                 |
| Papermark                   | Blocks the main screenshot shortcuts, blurs, warns, **logs the attempt, notifies the owner, can revoke access** | "Does not work in 100% of cases"                                                  |

#### Approaches beyond a normal browser tab (real black capture)

| Approach                   | Example                                                                                                                                    | Catch for us                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Browser-vendor enforcement | Microsoft Edge + Purview sensitivity labels: screen capture blocked for labelled PDFs in the OneDrive / SharePoint viewer (since Aug 2026) | Edge only, Microsoft 365 / Purview labels only, Microsoft's own viewer only. Can't be used for our viewer. |
| Enterprise browser         | Prisma Browser (Palo Alto Networks' managed browser): blurs content on capture attempts                                                    | Paid; Linux not supported; doesn't block screen sharing                                                    |
| DRM                        | Safari FairPlay, Widevine (how streaming video goes black)                                                                                 | Recurring licence; already rejected (§3.1)                                                                 |
| Installed secure viewer    | Locklizard Safeguard: an app that disables the operating system's screen-capture functions                                                 | Paid, needs installing. Locklizard itself says browser-only prevention isn't possible without DRM.         |

#### How ours compares with the script-based products

| Feature                                             | Real-world products        | Ours                                        |
| --------------------------------------------------- | -------------------------- | ------------------------------------------- |
| Black out when the browser loses focus              | Vitrium, Papermark         | ✅ PR #139                                  |
| Black out when the cursor leaves                    | DocSend Standard           | ✅ §2.3 #3                                  |
| Block screenshot shortcuts                          | Digify, Papermark          | ✅ §2.3 #1                                  |
| Idle blackout                                       | —                          | ✅ §2.3 #4                                  |
| Stay black until click                              | —                          | ✅ §2.3 #2                                  |
| Spotlight / strip under the cursor                  | DocSend Strict, Digify     | ⛔ Rejected (conflicts with the UI, §3.3.6) |
| Log capture attempts / notify owner / revoke access | Papermark                  | ❌ Missing                                  |
| Dynamic watermark                                   | Every vendor recommends it | ❌ Missing (planned as R5, server-side)     |

**Conclusion:** our capture blackout is at least on par with the commercial script-based products, and the industry treats this level as a deterrent, not a guarantee. The two things they all pair it with, which we don't have yet:

1. **Logging capture attempts to the audit trail.** PrintScreen can't be stopped, but "user X pressed PrintScreen on document Y" can be recorded. Needs a small backend endpoint.
2. **A per-user watermark burned in on the server (R5).** Makes any capture that gets through traceable.

Sources:

- [Dropbox DocSend: screenshot protection](https://help.dropbox.com/share/dropbox-docsend-screenshot-protection)
- [Digify: Screen Shield](https://digify.com/screenshot-protection.html)
- [Vitrium: screen capture prevention](https://www.vitrium.com/blog/screen-capture-prevention)
- [Papermark: screenshot protection](https://www.papermark.com/screenshot-protection.md)
- [MC1409303: Edge enforces screen capture restrictions for sensitivity-labelled PDFs](https://mc.merill.net/message/MC1409303)
- [Prisma Browser: screenshot control](https://docs.paloaltonetworks.com/prisma-browser/administration/manage-prisma-browser-policy-profiles/configure-prisma-browser-data-controls/configure-data-leak-prevention/screenshot)
- [Locklizard: stopping screen sharing and recording](https://locklizard.com/document-security-blog/stop-screen-sharing)

---

## 4. Spike findings

**Findings so far:**

- **No option meets R1, R2 and R3 together under the current constraints.**
- **DRM is not chosen.** It is the only way to get a true black capture, but its licences are a recurring cost that won't be approved. It also conflicts with R1, can't be used in the pdf.js viewer, and doesn't cover Linux or Chrome on macOS (§3.1).
- A desktop app (Electron or Tauri) only protects reliably on **Windows**. Neither supports Linux, and on macOS 15+ ScreenCaptureKit-based recorders still capture the window (§3.3.1).
- Everything browser-only is a deterrent: the interim measures in §2.

---

## 5. Solution options for stakeholders

No option meets R1, R2 and R3 on every platform. Stakeholders need to choose which loss is acceptable.

### Option A — Keep the browser viewer and keep patching the leaky bucket

Stay with the browser viewer. Ship the interim measures (PR #139 + §2.3) and accept that some captures can't be blocked. Full screenshot list in §2.4.

| Covered                                                                                                                                                | Not covered                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| R1 copy text, on every platform                                                                                                                        | PrintScreen on its own, and third-party tools bound to it (W-01, W-11)                                                             |
| All built-in macOS shortcuts: Cmd+Shift+3/4/5/6 and clipboard variants, including area selection and timers (M-01–M-08)                                | Hotkeys with no modifier, or only Shift / Cmd (macOS) / Ctrl (Windows): incl. Shift+PrtScn, Ctrl+PrtScn, F-keys (M-19, W-10, W-20) |
| Windows shortcuts with Win or Alt: Win+Shift+S, Win+PrtScn, Alt+PrtScn, Win+Alt+PrtScn, Win+G (W-03–W-07)                                              | Macros and dedicated screenshot keys that send all keys at once (M-14)                                                             |
| Capture apps opened from Start, Dock, Spotlight, tray or Terminal, including delayed / timer captures (M-09, M-10, W-08, W-09, W-13)                   | Recordings and screen shares already running while the user reads (TC-10–16); idle blackout only catches unattended ones           |
| Third-party and custom hotkeys using two+ modifiers, Ctrl/Option (macOS) or Win/Alt (Windows); browser extensions (M-11, M-13, M-15, M-16, W-12, W-16) | Background and remote capture: Windows Recall, remote desktop, screen sharing (M-18, W-18, W-19)                                   |
| Switching tab or app, print, save, right-click                                                                                                         | Windows 11 PrintScreen overlay, DevTools screenshot, Google Lens, menu-bar tools, tablet buttons: unknown until tested             |
| Windows, macOS and Linux, all browsers                                                                                                                 | Phone camera                                                                                                                       |

- **Cost:** low. Frontend only; no licence, no installer.
- **Risk:** it's a deterrent, not a guarantee. Each new capture tool may need another patch.
- **Side effect:** shortcuts that use these modifiers, and moving the mouse out of the window, also hide the PDF until the user clicks back in.

### Option B — DRM, accepting the loss of R1

Show each page as DRM-protected video and drop copy text.

| Covered                                                                                                                                   | Not covered                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| True black capture for every tool, including PrintScreen and running recordings: Windows with hardware DRM (Chrome/Edge), Safari on macOS | **R1: users can't select or copy text**           |
|                                                                                                                                           | Linux (any browser) and Chrome on macOS: captured |
|                                                                                                                                           | Windows PCs whose GPU/driver lacks hardware DRM   |
|                                                                                                                                           | Phone camera                                      |

- **Cost:** high and **recurring**. Commercial DRM licence (Widevine/PlayReady/FairPlay) for as long as the system runs, a licence server, a page-to-video pipeline, and a new viewer to replace pdf.js. Search and highlighting have to be rebuilt.
- **Risk:** not proven air-gapped. **Already ruled out because the recurring licence cost won't be approved** (§3.1).

### Option C — Desktop PDF reader (Electron) for PDFs only

Keep the DMS web app as it is. When a user opens a PDF, it opens in a small installed desktop reader (like a PDF reader on the PC). The reader's window is protected from capture. The web app only links to it (e.g. `govsuitedms://open?record=…`), and the reader fetches the PDF from the API with the user's token.

| Covered                                                                                                                                 | Not covered                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Windows 10 (2004+) / 11:** the PDF window is left out of every screenshot and recording, including PrintScreen and running recordings | **Linux:** no capture protection exists (falls back to Option A, or Linux users can't open PDFs) |
| R1 copy text (reader reuses pdf.js)                                                                                                     | **macOS 15+:** ScreenCaptureKit recorders (OBS, Zoom, Teams) still capture the window            |
| Rest of the web app unchanged                                                                                                           | Phone camera                                                                                     |
| Helps R4: the PDF never reaches the browser                                                                                             |                                                                                                  |

- **Cost:** medium. A small Electron app (one window: pdf.js + login handoff), installer, auto-update and IT rollout to every PC.
- **Condition:** the browser viewer must **stop showing PDFs** and only offer "Open in desktop reader". Otherwise users just view the PDF in the browser and bypass the reader.
- **Risk:** the hand-off from browser to app (custom link + passing the login token) needs careful security design.

### Option D — Full Electron wrapper of the whole DMS

Ship the whole DMS as a desktop app with capture protection on every window. The browser version is retired for document viewing.

| Covered                                                                                  | Not covered                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Windows 10 (2004+) / 11:** the whole app is left out of every screenshot and recording | **Linux: left out entirely.** Linux users either lose access or stay on the browser with Option A |
| R1 copy text                                                                             | **macOS 15+:** ScreenCaptureKit recorders still capture the window                                |
| Everything in the DMS is protected, not just PDFs                                        | Phone camera                                                                                      |

- **Cost:** highest of the non-DRM options. A second client for the whole product: every release has to be built, signed, distributed and auto-updated alongside the web app.
- **Condition:** browser access to documents must be blocked server-side. Otherwise users go back to the browser.
- **Risk:** the whole app is hidden from capture, so legitimate uses (screen sharing in meetings, IT support sessions, screenshotting a bug report) stop working too.

### Comparison

|                     | A. Leaky bucket       | B. DRM                            | C. Desktop PDF reader              | D. Full Electron wrapper           |
| ------------------- | --------------------- | --------------------------------- | ---------------------------------- | ---------------------------------- |
| R1 copy text        | ✅                    | ❌                                | ✅                                 | ✅                                 |
| R2/R3 on Windows    | ⚠️ Partial            | ✅ (hardware DRM PCs only)        | ✅                                 | ✅                                 |
| R2/R3 on macOS      | ⚠️ Partial            | ✅ Safari only                    | ⚠️ macOS 15+ recorders get through | ⚠️ macOS 15+ recorders get through |
| R2/R3 on Linux      | ⚠️ Partial (untested) | ❌                                | ❌                                 | ❌ Linux left out                  |
| Licence cost        | None                  | **Recurring (won't be approved)** | None                               | None                               |
| Build effort        | Low                   | Very high                         | Medium                             | High                               |
| Install on every PC | No                    | No                                | Yes                                | Yes                                |
| Ongoing maintenance | Low                   | High                              | Medium                             | High                               |
| Phone camera        | ❌                    | ❌                                | ❌                                 | ❌                                 |

### Recommendation

1. **Ship Option A now** for everyone. It is the only option that works on every platform, needs no install, and keeps R1. Be clear with stakeholders that it is a deterrent with known holes (listed above).
2. **If stakeholders need real blocking, add Option C on top, for Windows users.** It protects the PDF against every capture tool on Windows, keeps R1, and doesn't turn the whole DMS into a desktop app. macOS and Linux users stay on Option A.
3. **Don't choose B** (recurring licence cost, loses R1) **or D** (C gives the same protection for PDFs at lower cost, without blocking screen sharing for the rest of the app or leaving Linux users out).

Whatever is chosen, PrintScreen-to-file on uncovered platforms and phone cameras will still get through. That is why R5 (a watermark burned in on the server) is needed: any leaked capture is traceable to the user.

### Next steps

1. **Stakeholders choose** between A alone and A + C.
2. **Option A:** screenshot coverage (§2.3 #1–3) is implemented; test it against §2.4. Idle blackout (§2.3 #4, 30s) is implemented. Recordings running while the user reads stay uncovered at browser level.
3. **If C is chosen:** a short follow-up spike on the desktop reader: browser-to-app hand-off and login, installer and auto-update, and IT rollout to government PCs.
