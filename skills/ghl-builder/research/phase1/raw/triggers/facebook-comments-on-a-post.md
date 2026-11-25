# Trigger: Facebook - Comment(s) on a post

- **Screenshot:** `screenshots/b2-022-facebook-comments-on-a-post.png`
- **Status:** ⛔ integration-gated — live picker message: `No Facebook page was found. Please reach out to your admin to configure it.`

## Config surface to gate

| UI field | Input type | Options/source | Required | JSON mapping | Notes |
|---|---|---|---|---|---|
| Page | integration-backed picker | connected Facebook Pages | yes | inferred / uncaptured | Gate occurs before panel. |
| Post Type | mode selector | Published Post; Custom Post URL | yes | inferred / uncaptured | |
| Comment keyword | operator + text | Contains Phrase; Exact Match | no | inferred / uncaptured | |
| Track first-level comments only | toggle | on/off | no | inferred / uncaptured | Controls nested replies. |

## Gate evidence

- Screenshot captures the picker and exact missing-Page gate. No Facebook connection was added, no trigger was saved, and no JSON is claimed.
- Comments created by Reply In Comments are ignored to prevent loops. Source: https://help.gohighlevel.com/support/solutions/articles/155000004645

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: no Facebook Page was connected to the sub-account.
