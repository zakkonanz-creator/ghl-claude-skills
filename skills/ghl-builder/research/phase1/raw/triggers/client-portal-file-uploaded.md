# Client portal file uploaded

- **UI name:** Client portal file uploaded · **Category:** Membership · **Priority:** LONG_TAIL (B4-28)
- **JSON `type`:** `client_portal_file_uploaded`
- **Screenshot:** `screenshots/b4-028-client-portal-file-uploaded.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Client Portal File Uploaded` | yes | `name` | |
| Additional filters | optional filters | none documented | no filters | no | inferred / uncaptured | Add filters visible; official changelog lists none. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id040> kind=trigger -->
```json
{"id":"<id040>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"client_portal_file_uploaded","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Client Portal File Uploaded","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Official runtime semantics

- Fires when a contact uploads through Client Portal Shared Documents. Client Portal and Shared Documents are prerequisites; contacts can upload up to ten files at once, and no filters are documented.
- Source: [official HighLevel Client Portal file-upload changelog](https://ideas.gohighlevel.com/changelog/workflow-trigger-for-file-uploads-via-client-portal).
