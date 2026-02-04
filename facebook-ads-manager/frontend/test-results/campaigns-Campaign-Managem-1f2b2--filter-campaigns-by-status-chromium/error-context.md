# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - heading "Error" [level=1] [ref=e5]
    - heading "Something went wrong!" [level=2] [ref=e6]
    - paragraph [ref=e7]: An unexpected error occurred. Please try again.
    - button "Try again" [ref=e8] [cursor=pointer]
  - region "Notifications alt+T"
  - generic [ref=e11] [cursor=pointer]:
    - img [ref=e12]
    - generic [ref=e14]: 1 error
    - button "Hide Errors" [ref=e15]:
      - img [ref=e16]
  - alert [ref=e19]
```