# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - heading "404" [level=1] [ref=e5]
    - heading "Page Not Found" [level=2] [ref=e6]
    - paragraph [ref=e7]: The page you are looking for doesn't exist or has been moved.
    - link "Go to Dashboard" [ref=e8] [cursor=pointer]:
      - /url: /dashboard
  - region "Notifications alt+T"
  - alert [ref=e9]
```