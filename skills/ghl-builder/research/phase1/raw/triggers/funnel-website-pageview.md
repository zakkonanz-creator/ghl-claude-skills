# Trigger: Funnel/website pageview

- **JSON `type`:** `funnel_website_pageview` · **Screenshot:** `screenshots/b2-008-funnel-website-pageview.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Funnel/website Pageview` | yes | `name` | |
| Funnel/Website | operator + location picker | Is; Is empty; Is not; Is not empty; GHL funnel/site catalog | none | yes | `conditions[]` | `Is not empty` saved as `has_value`. |
| Page / Page Path / UTM fields | conditional filter rows | Is / any-of / none-of / empty operators | none | no | `conditions[]` | Exact variants uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id030> kind=trigger -->
```json
{"id":"<id030>","active":false,"conditions":[{"operator":"has_value","field":"funnelId","title":"Funnel/Website","type":"select_with_pagination","id":"funnelId"}],"type":"funnel_website_pageview","masterType":"internal","name":"Funnel/website Pageview","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Works only for GHL funnels/websites; use External Tracking for external sites. Source: https://help.gohighlevel.com/support/solutions/articles/155000003498
