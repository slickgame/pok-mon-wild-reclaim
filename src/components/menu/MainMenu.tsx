import { useGame } from "@/game/GameProvider";
import { MenuButton } from "./MenuButton";
import styles from "./MainMenu.module.css";

export function MainMenu() {
  const { setCurrentScreen } = useGame();

  return (
    <section className={styles.menuPanel} aria-labelledby="game-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Field Ranger Initiative</p>
        <h1 id="game-title">Pokémon Wild Reclaim</h1>
        <p className={styles.subtitle}>
          Restore damaged wild zones, rescue Pokémon, and rebuild safe habitats one expedition at a time.
        </p>
      </div>

      <nav className={styles.menuActions} aria-label="Main menu">
        <MenuButton description="Start the profile and save-slot flow in M1." onClick={() => setCurrentScreen("newGame")}>
          New Game
        </MenuButton>
        <MenuButton description="Load a local save slot once M1 adds persistence." onClick={() => setCurrentScreen("continue")}>
          Continue
        </MenuButton>
        <MenuButton description="View future accessibility and display options." onClick={() => setCurrentScreen("settings")}>
          Settings
        </MenuButton>
      </nav>
    </section>
  );
}
