import { useState } from "react";
import { ImageOff } from "lucide-react";
import { pokemonSpriteUrl, type SpeciesId } from "./outing";

export function PokemonSprite({ speciesId, className }: { speciesId: SpeciesId; className?: string }) {
  const src = pokemonSpriteUrl(speciesId);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const classes = className ? `pokemon-sprite ${className}` : "pokemon-sprite";

  if (unavailable === src) return <span className={`${classes} pokemon-sprite--unavailable`} aria-hidden="true">
    <ImageOff />
  </span>;

  return <img className={classes} src={src} alt="" draggable={false} onError={() => setUnavailable(src)} />;
}
