import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { SaveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chuncks = [];

  for await (const chunk of readable) {
    chuncks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chuncks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            await SaveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );
            break;

          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            await SaveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );
            break;

          default:
            throw new Error("Unhandled event.");
        }
      } catch (error) {
        return res.json({ error: "Webhook handler filed" });
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", " POST");
    res.status(405).end("Method not allowed");
  }
};
