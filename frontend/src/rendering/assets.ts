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

export const CHARACTER_IDLE: SpriteSource = { x: 0, y: 0, width: 32, height: 32 };
