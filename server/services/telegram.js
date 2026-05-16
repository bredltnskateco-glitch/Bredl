// Small Telegram bot sender that posts a message to a configured group.
// Falls back to console logging when token/chat are not configured.
// Mirrors the shape of services/mailer.js — never throws on send failure.

const https = require('https');

const escapeHtml = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const formatTND = (n) => `${Number(n || 0).toFixed(2)} TND`;

const send = ({ chatId, text, parseMode = 'HTML' }) =>
  new Promise((resolve) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = chatId || process.env.TELEGRAM_GROUP_CHAT_ID;
    if (!token || !targetChatId) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        event: 'telegram.console',
        chatId: targetChatId || null,
        text,
      }));
      return resolve({ delivered: false, mode: 'console' });
    }

    const payload = JSON.stringify({
      chat_id: targetChatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });

    const req = https.request({
      method: 'POST',
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 5000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ delivered: true, mode: 'telegram' });
        } else {
          console.warn('telegram.send.non2xx', res.statusCode, body.slice(0, 200));
          resolve({ delivered: false, mode: 'telegram-error' });
        }
      });
    });

    req.on('error', (err) => {
      console.warn('telegram.send.error', err.message);
      resolve({ delivered: false, mode: 'telegram-error' });
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn('telegram.send.timeout');
      resolve({ delivered: false, mode: 'telegram-timeout' });
    });

    req.write(payload);
    req.end();
  });

const formatOrderMessage = (order) => {
  const addr = order.shippingAddress || {};
  const lines = [];
  lines.push(`<b>🛹 New order ${escapeHtml(order.orderNumber)}</b>`);
  lines.push('');
  lines.push(`<b>Customer:</b> ${escapeHtml(addr.fullName || '—')}`);
  if (addr.phone) lines.push(`<b>Phone:</b> ${escapeHtml(addr.phone)}`);
  const addressLine = [addr.street, addr.city, addr.postalCode, addr.country]
    .filter(Boolean).join(', ');
  if (addressLine) lines.push(`<b>Address:</b> ${escapeHtml(addressLine)}`);
  lines.push(`<b>Payment:</b> ${escapeHtml(order.paymentMethod)}`);
  lines.push('');
  lines.push('<b>Items:</b>');
  (order.items || []).forEach((it) => {
    const variant = [it.selectedSize, it.selectedColor].filter(Boolean).join(' / ');
    const label = variant ? `${it.name} (${variant})` : it.name;
    lines.push(` • ${it.quantity}× ${escapeHtml(label)} — ${formatTND(it.price * it.quantity)}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${formatTND(order.itemsTotal)}`);
  if (Number(order.discount) > 0) {
    const promo = order.promoCode ? ` (${escapeHtml(order.promoCode)})` : '';
    lines.push(`Discount${promo}: −${formatTND(order.discount)}`);
  }
  lines.push(`Shipping: ${formatTND(order.shippingCost)}`);
  lines.push(`<b>Total: ${formatTND(order.total)}</b>`);
  if (order.notes) {
    lines.push('');
    lines.push(`<i>Notes: ${escapeHtml(order.notes)}</i>`);
  }
  return lines.join('\n');
};

const sendOrderNotification = (order) => {
  try {
    return send({ text: formatOrderMessage(order) });
  } catch (err) {
    console.warn('telegram.format.error', err.message);
    return Promise.resolve({ delivered: false, mode: 'format-error' });
  }
};

module.exports = { send, sendOrderNotification };
