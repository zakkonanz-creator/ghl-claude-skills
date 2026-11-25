# Trigger: Scheduler

- **Screenshot:** `screenshots/b2-016-scheduler.png`
- **Premium:** no
- **Status:** ⛔ workflow-structure gated — Scheduler is mutually exclusive with every other trigger, while the required B2 batch workflow already contains the other B2 triggers.

## Config surface to gate

| UI label | Input type | Options/source | Default | Required | JSON mapping | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Scheduler` | yes | inferred / uncaptured | Default panel captured. |
| Interval | dropdown/conditional scheduler | Hourly; Daily; Weekly; Monthly; Specific date/time; Cron expression | none | yes | inferred / uncaptured | Not saved because doing so would violate the batch workflow's trigger structure. |
| Advanced settings | conditional controls | Skip Weekends; Stop On end date | off/none | no | inferred / uncaptured | |
| Check trigger schedule | preview button | next five runs | — | no | not persisted | Uses sub-account timezone. |

## Gate evidence

- The live default panel was captured, but it was not saved because official behavior makes Scheduler mutually exclusive with all other triggers. No node ID exists and no `Verified JSON` is claimed.
- Scheduler is contactless and should be paired with contactless actions. All schedule times use the sub-account timezone. Source: https://help.gohighlevel.com/support/solutions/articles/155000006653

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: Scheduler is mutually exclusive with the other triggers already required in the B2 workflow.
