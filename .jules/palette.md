# Palette's Journal

## 2025-02-18 - Input Accessibility & Submission State Feedback in Tasks
**Learning:** In highly customized select and input component environments, assistive technologies frequently lose association context. Explicitly mapping `Label` elements via matching `htmlFor` and `id` properties is necessary, especially for non-native inputs. Standardizing visual submit feedback with localized indicators (e.g., Turkish "Oluşturuluyor..." alongside a spinner) ensures continuous visual orientation during async operations.
**Action:** Always map inputs to labels via `htmlFor` and `id` across all views, and leverage `isSubmitting` with localized loaders for submit operations.
