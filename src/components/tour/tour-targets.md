# Tour Target Attributes

The guided tour uses `data-tour` attributes to locate UI elements for each step.
Below is the mapping of each attribute to the component where it should be placed.

| `data-tour` value       | Component / File                          | Element description                        |
|--------------------------|-------------------------------------------|--------------------------------------------|
| `dashboard-actions`      | `App.tsx` > `DashboardView`               | Stats grid container (quick actions area)  |
| `simulate-btn`           | `App.tsx` > `DashboardView`               | "Simular organizacao" button               |
| `nav-rules`              | `components/layout/Sidebar.tsx`           | Rules nav item button                      |
| `nav-profiles`           | `components/layout/Sidebar.tsx`           | Profiles nav item button                   |
| `nav-history`            | `components/layout/Sidebar.tsx`           | History nav item button                    |
| `nav-help`               | `components/layout/Sidebar.tsx`           | Help nav item button                       |

## How it works

Each tour step in `src/content/tour/steps.json` has a `target` field with a CSS selector
like `[data-tour='nav-rules']`. The `TourController` uses `document.querySelector()`
to find the element at runtime and positions the spotlight overlay and tooltip card
relative to its bounding rect.

## Adding new tour steps

1. Add the step definition to `src/content/tour/steps.json`
2. Add a `data-tour="your-id"` attribute to the target element in the relevant component
3. The tour will automatically include the new step based on the `order` field
