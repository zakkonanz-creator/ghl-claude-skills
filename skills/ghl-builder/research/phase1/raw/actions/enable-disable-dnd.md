# Action: Enable/Disable DND (Set DND)

- **UI name:** Enable/disable DND · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `dnd_contact` (node label "Dnd Contact"; from Phase-0 read schema `dnd_contact`)
- **Screenshot:** `082-dnd-panel.png`, `083-dnd-options.png`
- **Premium:** no · **Description:** "Activate do-not-disturb for the contact"

## Config panel fields  (`verified: saved-node` — "Enable DND for all channels", outbound)

| UI label | Input type | Options | Default | JSON path (VERIFIED) | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text | — | "Enable/disable DND" | node `name` | |
| DND DIRECTION | dropdown | Outbound (default) [/ Inbound — not expanded] | Outbound | `attributes.dnd_direction` (`"outbound"`) | |
| DND | dropdown ("Select") | **Disable DND for all channels** / **Disable DND for specific channels** / **Enable DND for all channels** / **Enable DND for specific channels** | (none) | `attributes.dnd_contact` (`"enable"` \| `"disable"` \| `"enable_specific"` \| `"disable_specific"`) | required. The specific-channel suffix is verified from the saved Enable variant. |
| CHANNELS | multiselect (specific-channel modes only) | Call, SMS, Email, WhatsApp, FB, GMB | none | `attributes.specific_channels[]` | Exact enum strings preserve the live UI casing. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000273 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000273",
  "parent": "00000000-0000-4000-8000-000000000274",
  "order": 0,
  "attributes": {
    "type": "dnd_contact",
    "dnd_direction": "outbound",
    "dnd_contact": "enable_specific",
    "specific_channels": [
      "Call",
      "SMS",
      "Email",
      "WhatsApp",
      "FB",
      "GMB"
    ]
  },
  "name": "Enable/disable DND",
  "type": "dnd_contact",
  "parentKey": "00000000-0000-4000-8000-000000000274"
}
```
Keys are **`dnd_direction`** + **`dnd_contact`**. My earlier inferred keys (`direction`/`allChannels`/`channels`, enum `enable_dnd`) were wrong. All-channel modes use `dnd_contact:"enable"|"disable"`; an older saved witness with `specific_channels:[]` round-trips as all channels. The native R2 capture proves that specific-channel mode instead uses `dnd_contact:"enable_specific"` and a nonempty `specific_channels` array with exact members `Call`, `SMS`, `Email`, `WhatsApp`, `FB`, `GMB`. `disable_specific` is the directly corresponding picker mode but was not separately saved.

## Quirks
- 4 UI combos: {Enable,Disable} × {all channels, specific channels}. Verified saved encodings: all-channel Enable → `enable`; specific-channel Enable → `enable_specific` plus the selected `specific_channels[]`. The symmetric Disable enums are `disable` and picker-derived `disable_specific`; the latter remains uncaptured as a saved node.
- Not location-data-dependent (channels are platform-fixed).
