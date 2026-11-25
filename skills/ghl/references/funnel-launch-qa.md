# Funnel and webinar launch QA (checkout, copy, format)

Written after a real launch where the checkout hero was cut off by the header on
phones and the checkout headline didn't match the sales page.

Run this before any sales page, checkout, webinar offer or promo goes live, and
again after every edit to any page in the funnel. Any failed line blocks launch.
Report each line as pass or fail, with the proof (diff output, screenshot path,
HTTP status).

## 1. Checkout copy matches the sales page

Pull the visible text of both live pages and diff them. Don't compare from memory
or from the builder.

```bash
ts=$(date +%s)
for u in "$SALES_URL" "$CHECKOUT_URL"; do
  curl -sL "$u?cb=$ts" | python3 -c 'import sys,re,html
t=sys.stdin.read()
t=re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>"," ",t)
t=html.unescape(re.sub(r"<[^>]+>","\n",t))
print("\n".join(l.strip() for l in t.splitlines() if l.strip()))'
done
```

Check each of these on both pages. Any mismatch blocks launch.

- Headline, word for word.
- Price and the strike-through price.
- Coupon code.
- Buyer limit wording (for example "first 100 buyers").
- Start date and every session date.
- The "what's included" list.
- Bonuses.
- Guarantee.
- Help / support email.

## 2. Leftovers from the last launch

Search both pages' text, and the thank-you page, for:

- Old coupon codes.
- Seat, sold or "spots left" counters that belong to an old offer.
- Old offer items or bonuses.
- Placeholder text, lorem ipsum, or unfilled `{{ }}` merge fields.
- Wrong dates, wrong year, wrong weekday for a date.

## 3. Coupon in GHL Payments matches the page

Open the coupon in Payments, Coupons and check:

- The code is the same as on the page.
- The amount or percent gives the price the page shows.
- It applies to the right product and price.
- Usage limit equals the page's buyer limit.
- Limited to 1 per customer.
- End date matches the offer end date on the page.
- Coupons from earlier launches are deactivated.

## 4. Format QA on desktop and phone

Take screenshots at desktop 1440 wide and at phone size (iPhone 13). Look at
the screenshots. A DOM check alone misses overlap and clipping.

- No horizontal scroll.
- The hero and H1 are not under the header or cut by it.
- No clipped or overlapping text.
- Every image loads.
- Every button and link works and goes to the right place.

Do this for the sales page, the checkout and the thank-you page.

## 5. Thank-you page

- It shows the correct next step for this offer.
- Every link on it works.

## 6. After purchase

Run a real test purchase (or a 100% test coupon) and check:

- The purchase workflow fires (check its enrollment history).
- The welcome email copy matches the offer: same name, dates, items, bonuses.
- Community and course access is granted.
- Follow-up emails link to the live URLs (sales page, replay page). Each URL
  returns 200, or the page is scheduled to exist before that email sends.

## 7. Drafts are not live

- GHL page edits only go live after Publish. Saving is not enough.
- After publishing, re-check the live URL with a fresh cache-buster and rerun
  sections 1, 2 and 4 on it.
