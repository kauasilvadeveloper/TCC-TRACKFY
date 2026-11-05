import { useContext } from "react";
import Link from "next/link"; // ou react-router-dom
import { useTheme } from "@/src/context/ThemeContext";
import styles from "./Brand.module.scss";

export function Brand() {
  const { theme } = useTheme();

  // Ajuste a verificação conforme os valores salvos no seu estado ('dark', 'light', 'black', etc.)
  const logoSrc =
    theme === "dark"
      ? "/logo-trackfy-blacktheme.png"
      : "/logo-trackfy-whitetheme.png";

  return (
    <Link href="/dashboard" className={styles.brand}>
      <img src={logoSrc} alt="Trackfy Logo" className={styles.logoImg} />
    </Link>
  );
}
