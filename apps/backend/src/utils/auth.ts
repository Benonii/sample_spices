// Placeholder Better Auth setup. Configure providers as needed.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { username } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import { stripeClient } from "./stripe";
import { sendResetPassword, sendVerificationEmail } from "./email";
import { createOrder } from "@/order/functions";
import { deactivateUserCartItems, updateCartItem } from "@/cart/functions";

export const auth = betterAuth({
  appName: "DripTech",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendVerificationEmail(user.name, user.email, url, token)
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendResetPassword({ user, url, token })
    },
  },
  trustedOrigins: ["http://localhost:5173", "http://localhost:5174"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: true,
    },
  },
  plugins: [
    username(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      createCustomerOnSignUp: true,
      onEvent: async (event) => {
        if (event.type === "checkout.session.completed") {
          // Extract data from Stripe checkout.session.completed event
          const session = event.data.object as any;
          const customerEmail = session.customer_details?.email;
          const amount = session.amount_total;
          const addressID = session.metadata?.addressID;
          const userID = session.metadata?.userID
          const productIDs = session.metadata?.productIDs?.split(',') || [];

          // Get line items with quantities from Stripe session
          const lineItems = await stripeClient.checkout.sessions.listLineItems(session.id);

          if (productIDs.length > 0 && addressID && lineItems.data.length > 0) {
            try {
              console.log(`Checkout completed for customer ${customerEmail}, amount ${amount}, products: ${productIDs.join(', ')}`);

              // Create an order for each product with its quantity from line items
              const orderPromises = productIDs.map(async (productID: string, index: number) => {
                const lineItem = lineItems.data[index];
                const order = await createOrder({
                  userID,
                  addressID,
                  productID,
                  quantity: lineItem?.quantity || 1,
                  taxAmount: 0,
                  shippingCost: 0,
                  discountAmount: 0,
                  paymentMethod: "stripe",
                  notes: `Stripe payment - Session ID: ${session.id}`,
                });
                return order;
              });

              await Promise.all(orderPromises);
              await deactivateUserCartItems(userID);
              console.log(`userID: ${userID} cart items deactivated`);
              console.log(`Successfully created ${productIDs.length} orders for customer ${customerEmail}`);
            } catch (error) {
              console.error("Error creating orders from Stripe webhook:", error);
            }
          } else {
            console.log("Missing required data for order creation:", { productIDs, addressID });
          }
        }
      },
    }),
  ]
});
