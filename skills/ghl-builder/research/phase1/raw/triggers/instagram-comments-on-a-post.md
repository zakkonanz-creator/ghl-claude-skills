# Trigger: Instagram - Comment(s) on a post

- **Screenshot:** `screenshots/b2-023-instagram-comments-on-a-post.png`
- **Status:** ⛔ integration-gated — live picker message: `No Instagram page was found. Please reach out to your admin to configure it.`

## Config surface to gate

| UI field | Input type | Options/source | Required | JSON mapping | Notes |
|---|---|---|---|---|---|
| Page | integration-backed picker | Instagram business accounts via Facebook integration | yes | inferred / uncaptured | Gate occurs before panel. |
| Post Type | mode selector | Published Post; Custom Post URL | yes | inferred / uncaptured | |
| Comment keyword | operator + text | Contains Phrase; Exact Match | no | inferred / uncaptured | |
| Track First Level Comment Only | toggle | on/off | no | inferred / uncaptured | |

## Gate evidence

- Screenshot captures the picker and exact missing-Instagram-Page gate. No connection was added, no trigger was saved, and no JSON is claimed.
- Workflow-generated comments are excluded to avoid loops. Source: https://help.gohighlevel.com/support/solutions/articles/155000004646

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: no Instagram Page was connected to the sub-account.
