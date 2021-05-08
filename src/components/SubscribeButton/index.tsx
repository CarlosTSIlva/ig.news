import style from "./styles.module.scss";

interface SubescribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubescribeButtonProps) {
  return <button className={style.subscribeButton}>Subscribe now</button>;
}
