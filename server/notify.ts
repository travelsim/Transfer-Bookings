import type { BookingEnquiry } from "@shared/schema";

/**
 * Operator notification.
 *
 * The site promises the customer a reply, but nothing in the original stack
 * told the operator an enquiry had arrived. This posts the enquiry to a
 * configured webhook, which can be pointed at whatever the operator already
 * reads: an email bridge, a Slack/Teams channel, or a CRM intake endpoint.
 *
 * Delivery is best-effort by design. The enquiry is already durably stored
 * before this runs, so a notification failure must not fail the customer's
 * request -- it is logged loudly instead.
 */

function summarise(enquiry: BookingEnquiry): Record<string, unknown> {
  return {
    id: enquiry.id,
    name: `${enquiry.firstName} ${enquiry.lastName}`,
    email: enquiry.email,
    phone: enquiry.phone,
    from: enquiry.whereFrom,
    to: enquiry.whereTo,
    pickupDate: enquiry.pickupDate,
    returnTrip: enquiry.returnTrip,
    returnDate: enquiry.returnDate,
    returnTime: enquiry.returnTime,
    returnAddress: enquiry.returnAddress,
    passengers: `${enquiry.numAdults} adult(s), ${enquiry.numChildren ?? 0} child(ren)`,
    additionalInfo: enquiry.additionalInfo,
    receivedAt: enquiry.createdAt,
  };
}

export async function notifyOperator(enquiry: BookingEnquiry): Promise<void> {
  const url = process.env.OPERATOR_WEBHOOK_URL;

  if (!url) {
    console.warn(
      `Enquiry ${enquiry.id} stored, but OPERATOR_WEBHOOK_URL is not set, so no ` +
        "notification was sent. Configure it or enquiries will sit unseen.",
    );
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.OPERATOR_WEBHOOK_SECRET
          ? { authorization: `Bearer ${process.env.OPERATOR_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({
        event: "booking.enquiry.received",
        ...summarise(enquiry),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `Operator webhook responded ${response.status} for enquiry ${enquiry.id}. ` +
          "The enquiry is stored and must be picked up manually.",
      );
    }
  } catch (error: any) {
    console.error(
      `Operator notification failed for enquiry ${enquiry.id}: ${error?.message}. ` +
        "The enquiry is stored and must be picked up manually.",
    );
  }
}