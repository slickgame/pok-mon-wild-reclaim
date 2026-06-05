import styles from "./AppShell.module.css";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className={styles.shell}>
      <div className={styles.backgroundBadge}>Wild Reclaim</div>
      {children}
    </main>
  );
}
