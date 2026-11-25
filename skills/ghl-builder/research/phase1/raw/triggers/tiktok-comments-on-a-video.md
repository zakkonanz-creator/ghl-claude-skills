# Trigger: TikTok - comment(s) on a video

- **Screenshots:** `screenshots/b1-009-tiktok-comments-on-a-video.png`, `screenshots/b1-009-tiktok-comments-on-a-video-gate.png`
- **Status:** ⛔ integration-gated — selecting `Account is` opens an empty picker with exact text `No result found.`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | yes | inferred / uncaptured | Default title-cased name |
| Account is | TikTok account picker | integration-dependent | inferred / uncaptured | No connected accounts in lab |
| Post type | Published Posts / Custom URL | no | inferred / uncaptured | No selection means all posts |
| Contains phrase | text condition | no | inferred / uncaptured | Observed filter field |
| Exact Match | text condition | no | inferred / uncaptured | Observed filter field |

## Gate evidence

The trigger panel and filter catalog were enumerated, then the account picker was opened read-only. It contains no TikTok account. No external integration was connected, no trigger was saved, and no JSON is claimed.
