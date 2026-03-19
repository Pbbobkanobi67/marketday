import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export function buildOrderConfirmationEmail({
  customerName,
  orderNumber,
  marketDate,
  marketLocation,
  items,
  subtotal,
  paymentMethod,
}: {
  customerName: string
  orderNumber: string
  marketDate: string
  marketLocation: string
  items: { name: string; quantity: number; price: number; unit: string }[]
  subtotal: number
  paymentMethod: 'STRIPE' | 'AT_MARKET'
}): string {
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #E8DDD0">${i.name} <span style="color:#7C5C3E;font-size:13px">\u00d7 ${i.quantity} ${i.unit}</span></td><td style="text-align:right;padding:6px 0;border-bottom:1px solid #E8DDD0">${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(i.price/100)}</td></tr>`
    )
    .join('')

  const paymentNote =
    paymentMethod === 'STRIPE'
      ? 'Your order has been paid online and is confirmed.'
      : 'Your order is reserved. Please bring cash or card to pay at the stand.'

  return `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
  <div style="max-width:540px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E8DDD0">
    <div style="background:#6B8F71;padding:28px 32px">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:600">Backroads Certified Farmers Market</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">El Cajon, CA</p>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 4px;color:#4A3728;font-size:20px">Your order is confirmed, ${customerName.split(' ')[0]}!</h2>
      <p style="color:#7C5C3E;margin:0 0 24px;font-size:14px">${paymentNote}</p>

      <div style="background:#F5EFE4;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#7C5C3E;text-transform:uppercase;letter-spacing:0.5px">Order Number</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#4A3728;font-family:monospace">${orderNumber}</p>
      </div>

      <div style="margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#7C5C3E;text-transform:uppercase;letter-spacing:0.5px">Pickup At</p>
        <p style="margin:0;font-size:15px;color:#4A3728;font-weight:500">${marketDate}</p>
        <p style="margin:2px 0 0;font-size:14px;color:#7C5C3E">${marketLocation}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:600;color:#4A3728">Total</td>
            <td style="text-align:right;padding:12px 0 0;font-weight:600;color:#6B8F71;font-size:18px">${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(subtotal/100)}</td>
          </tr>
        </tfoot>
      </table>

      <hr style="border:none;border-top:1px solid #E8DDD0;margin:24px 0">
      <p style="margin:0;font-size:13px;color:#7C5C3E">Questions? Reply to this email or find us at the info booth on market day.</p>
    </div>
  </div>
</body>
</html>`
}
