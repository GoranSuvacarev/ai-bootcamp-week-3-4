export type SpriteSource = { x: number; y: number; width: number; height: number };

export type GameAssets = {
  terrain: HTMLImageElement;
  city: HTMLImageElement;
  props: HTMLImageElement;
  buildings: HTMLImageElement;
  floors: HTMLImageElement;
  scout: HTMLImageElement;
  zombie: HTMLImageElement;
  cyclops: HTMLImageElement;
  backdropWarm: HTMLImageElement;
  backdropCool: HTMLImageElement;
  backdropWindows: HTMLImageElement;
  roofTeal: HTMLImageElement;
  roofSlate: HTMLImageElement;
  safehouse: HTMLImageElement;
  antenna: HTMLImageElement;
  dangerSign: HTMLImageElement;
};

const assetPaths = {
  terrain: "/assets/1_Terrains_and_Fences_32x32.png",
  city: "/assets/2_City_Terrains_32x32.png",
  props: "/assets/3_City_Props_32x32.png",
  buildings: "/assets/4_Generic_Buildings_32x32.png",
  floors: "/assets/5_Floor_Modular_Buildings_32x32.png",
  scout: "/assets/Modern_Exteriors_Characters_Scout_32x32_1.png",
  zombie: "/assets/Modern_Exteriors_Characters_Zombie_1_32x32.png",
  cyclops: "/assets/Modern_Exteriors_Characters_Zombie_2_32x32.png",
  backdropWarm: "/assets/scenery/backdrop-condo-warm.png",
  backdropCool: "/assets/scenery/backdrop-condo-cool.png",
  backdropWindows: "/assets/scenery/backdrop-window-strip.png",
  roofTeal: "/assets/scenery/roof-panel-teal.png",
  roofSlate: "/assets/scenery/roof-panel-slate.png",
  safehouse: "/assets/scenery/safehouse.png",
  antenna: "/assets/scenery/antenna.png",
  dangerSign: "/assets/scenery/danger-sign.png",
} as const;

const createImage = (src: string) => {
  const image = new Image();
  image.src = src;
  return image;
};

export const createGameAssets = (): GameAssets => ({
  terrain: createImage(assetPaths.terrain),
  city: createImage(assetPaths.city),
  props: createImage(assetPaths.props),
  buildings: createImage(assetPaths.buildings),
  floors: createImage(assetPaths.floors),
  scout: createImage(assetPaths.scout),
  zombie: createImage(assetPaths.zombie),
  cyclops: createImage(assetPaths.cyclops),
  backdropWarm: createImage(assetPaths.backdropWarm),
  backdropCool: createImage(assetPaths.backdropCool),
  backdropWindows: createImage(assetPaths.backdropWindows),
  roofTeal: createImage(assetPaths.roofTeal),
  roofSlate: createImage(assetPaths.roofSlate),
  safehouse: createImage(assetPaths.safehouse),
  antenna: createImage(assetPaths.antenna),
  dangerSign: createImage(assetPaths.dangerSign),
});

export const isLoaded = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;

export const drawSprite = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  source: SpriteSource,
  destination: { x: number; y: number; width: number; height: number },
) => {
  if (!isLoaded(image)) return;
  context.drawImage(image, source.x, source.y, source.width, source.height, destination.x, destination.y, destination.width, destination.height);
};

// These sheets use a 32px horizontal grid but different vertical padding and
// visual heights. Keeping the exact source rectangles here prevents partial
// heads and empty cells from being rendered as complete characters.
export const CHARACTER_FRAMES = {
  scoutIdle: { x: 0, y: 16, width: 32, height: 48 },
  zombieIdle: { x: 0, y: 20, width: 32, height: 44 },
  cyclopsIdle: { x: 0, y: 32, width: 32, height: 32 },
} as const satisfies Record<string, SpriteSource>;
