interface SendEmailBinding {
  send(message: {
    to: string;
    from: string;
    subject: string;
    text: string;
    replyTo?: { email: string; name?: string };
  }): Promise<{ messageId: string }>;
}

interface Env {
  EMAIL: SendEmailBinding;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}

type TurnstileResult = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const value = (data: FormData, key: string, max: number) => {
  const raw = data.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
};

const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite === "cross-site")
    return json({ success: false, message: "Invalid request." }, 403);

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ success: false, message: "Invalid form data." }, 400);
  }

  // Bots commonly fill this hidden field. Return success without sending mail.
  if (value(data, "companyWebsite", 200))
    return json({
      success: true,
      message: "Thank you. Your message has been sent.",
    });

  const firstName = value(data, "firstName", 80);
  const lastName = value(data, "lastName", 80);
  const email = value(data, "email", 254);
  const phone = value(data, "phone", 50);
  const message = value(data, "message", 5000);
  const privacy = value(data, "privacy", 20);
  const turnstileToken = value(data, "cf-turnstile-response", 2048);

  if (
    !firstName ||
    !lastName ||
    !isEmail(email) ||
    !message ||
    privacy !== "accepted"
  ) {
    return json(
      {
        success: false,
        message: "Please complete all required fields correctly.",
      },
      400,
    );
  }
  if (!env.TURNSTILE_SECRET_KEY || !turnstileToken) {
    return json(
      {
        success: false,
        message: "The security check is missing. Please reload the page.",
      },
      400,
    );
  }

  const validation = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
      }),
    },
  );
  const result = (await validation.json()) as TurnstileResult;
  if (!result.success || (result.action && result.action !== "contact")) {
    return json(
      {
        success: false,
        message: "The security check failed. Please try again.",
      },
      403,
    );
  }

  const contactTo = env.CONTACT_TO || "info@talendos.com";
  const contactFrom = env.CONTACT_FROM || "website@talendos.com";
  try {
    await env.EMAIL.send({
      to: contactTo,
      from: contactFrom,
      replyTo: { email, name: `${firstName} ${lastName}` },
      subject: `Website enquiry from ${firstName} ${lastName}`,
      text: [
        "New enquiry via talendos.com",
        "",
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${phone || "not provided"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Contact email failed", error);
    return json(
      {
        success: false,
        message:
          "Your message could not be sent right now. Please use email or phone instead.",
      },
      502,
    );
  }

  return json({
    success: true,
    message: "Thank you. Your message has been sent.",
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ success: false, message: "Method not allowed." }, 405);
};
