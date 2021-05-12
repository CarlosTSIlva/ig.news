import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/dist/client/router";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import style from "./styles.module.scss";

interface SubescribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubescribeButtonProps) {
  const [session] = useSession();
  const router = useRouter();
  async function hancleSubscribe() {
    if (!session) {
      signIn("github");
      return;
    }

    if (session.activeSubscription) {
      router.push("/posts");
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
