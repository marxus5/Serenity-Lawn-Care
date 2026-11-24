const { Resend } = require("resend");

const MAX_LENGTHS = {
  name: 100,
  phone: 50,
  email: 254,
  message: 5000
};

function cleanField(value) {
  return value.trim();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];
  });
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!request.headers["content-type"]?.includes("application/json")) {
    return response.status(415).json({ error: "Expected a JSON request." });
  }

  const body = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ error: "Invalid quote request." });
  }

  if (typeof body._gotcha === "string" && body._gotcha.trim()) {
    return response.status(200).json({ ok: true });
  }

  for (const [field, maxLength] of Object.entries(MAX_LENGTHS)) {
    if (typeof body[field] !== "string" || body[field].length > maxLength) {
      return response.status(400).json({ error: "Please check the quote request fields." });
    }
  }

  const name = cleanField(body.name);
  const phone = cleanField(body.phone);
  const email = cleanField(body.email);
  const message = cleanField(body.message);

  if (!name || !phone || !message) {
    return response.status(400).json({ error: "Please complete the required fields." });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: "Please provide a valid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const recipient = process.env.QUOTE_REQUEST_TO;

  if (!apiKey || !sender || !recipient) {
    console.error("Quote email is not configured: required environment variables are missing.");
    return response.status(503).json({ error: "Quote email is not configured." });
  }

  const text = [
    "New quote request from the Serenity Lawn Care website",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    "",
    "Project details:",
    message
  ].join("\n");
  const html = [
    "<h1>New website quote request</h1>",
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>`,
    "<p><strong>Project details:</strong></p>",
    `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
  ].join("");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: sender,
      to: recipient,
      replyTo: email || undefined,
      subject: "New Serenity Lawn Care quote request",
      text,
      html
    });

    if (error) {
      console.error("Quote email delivery failed:", error.name || "Resend API error");
      return response.status(502).json({ error: "Could not send the quote request." });
    }
  } catch (error) {
    console.error("Quote email delivery failed:", error.code || error.name || "Unknown error");
    return response.status(502).json({ error: "Could not send the quote request." });
  }

  return response.status(200).json({ ok: true });
};
