import styles from "./MenuButton.module.css";

type MenuButtonProps = {
  children: React.ReactNode;
  description: string;
  onClick: () => void;
};

export function MenuButton({ children, description, onClick }: MenuButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onClick}>
      <span className={styles.label}>{children}</span>
      <span className={styles.description}>{description}</span>
    </button>
  );
}
