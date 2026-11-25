# EXAMPLE FAIL — deliberately-wrong add-to-workflow doc  [demonstrates a FAIL run]

> Same real node as add-to-workflow (`fa2a02d1…`), but the documented JSON below is
> deliberately WRONG in two ways to show the verifier catching it:
>  1. `attributes.workflowId` — wrong key name (real key is `workflow_id`) → MISSING
>  2. `attributes.input_trigger_params` documented as a STRING, real is a bool → TYPE

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000172 kind=action -->
```json
{
  "name": "Add to Workflow",
  "type": "add_to_workflow",
  "attributes": {
    "type": "add_to_workflow",
    "workflowId": "00000000-0000-4000-8000-000000000173",
    "input_trigger_params": "false"
  }
}
```
