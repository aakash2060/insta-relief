
async function sendEmail(apiKey, to, sender, subject, htmlBody, textBody) {
  const res = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": apiKey,
    },
    body: JSON.stringify({
      to,
      sender,
      subject,
      html_body: htmlBody,
      text_body: textBody,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error("SMTP2GO Error: " + JSON.stringify(error));
  }

  return res.json();
}

module.exports = { sendEmail };
