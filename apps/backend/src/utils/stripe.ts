import Stripe from "stripe";

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
})


export const createCheckoutSession = async ({
    products,
    addressID,
    userID
}: {
    products: {
        id: string,
        name: string,
        price: number,
        quantity: number,
    }[],
    addressID: string,
    userID: string
}) => {
    console.log(addressID, 'addressID');
    const session = await stripeClient.checkout.sessions.create({
        mode: "payment",
        line_items: products.map(product => ({
            price_data: {
                currency: "usd",
                unit_amount: Math.round(product.price * 100), // Convert to cents
                product_data: {
                    name: product.name,
                },
            },
            quantity: product.quantity,
        })),
        metadata: {
            userID,
            productIDs: products.map(product => product.id).join(','),
            addressID
        },
        success_url: `https://benoni.work`,
        cancel_url: `https://benoniw.work`,
    });
    return session;
}