import { signIn, useSession } from "next-auth/client";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import style from "./styles.module.scss";

interface SubescribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubescribeButtonProps) {
  const [session] = useSession();

  async function hancleSubscribe() {
    if (!session) {
      signIn("github");
      return;
    }

    try {
      const response = await api.post("/subscribe");
      const { sessionId } = response.data;
      const stripe = await getStripeJs();
      await stripe.redirectToCheckout({ sessionId: sessionId.id });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <button onClick={hancleSubscribe} className={style.subscribeButton}>
      Subscribe now
    </button>
  );
}
