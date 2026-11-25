# Action: Reply in comments

- **Screenshot:** `screenshots/b1-025-reply-in-comments.png`
- **Status:** ⛔ trigger/integration-gated — requires a Facebook, Instagram, or TikTok comment trigger

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Replies | repeatable text, max 10 | yes | inferred / uncaptured | One reply selected randomly per comment |
| Like Comments | toggle | no | inferred / uncaptured | |

## Gate evidence

Exact picker prerequisite: `Facebook - Comment(s) on a post, Instagram - Comment(s) on a post or TikTok - comment(s) on a video Trigger should be present to use this action`. No external account/trigger was added, no action was saved, and no JSON is claimed.
