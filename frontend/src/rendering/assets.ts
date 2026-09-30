export type SpriteSource = { x: number; y: number; width: number; height: number };

export type GameAssets = {
  scout: HTMLImageElement;
  zombie: HTMLImageElement;
  cyclops: HTMLImageElement;
  backdropWarm: HTMLImageElement;
  backdropCool: HTMLImageElement;
  platformLeft: HTMLImageElement;
  platformMiddle: HTMLImageElement;
  platformRight: HTMLImageElement;
  officeWindow: HTMLImageElement;
  signalBeacon: HTMLImageElement;
  antenna: HTMLImageElement;
};

const assetPaths = {
  scout: "/assets/Modern_Exteriors_Characters_Scout_32x32_1.png",
  zombie: "/assets/Modern_Exteriors_Characters_Zombie_1_32x32.png",
  cyclops: "/assets/Modern_Exteriors_Characters_Zombie_2_32x32.png",
  backdropWarm: "/assets/scenery/backdrop-condo-warm.png",
  backdropCool: "/assets/scenery/backdrop-condo-cool.png",
  platformLeft: "/assets/scenery/platform-left.png",
  platformMiddle: "/assets/scenery/platform-middle.png",
  platformRight: "/assets/scenery/platform-right.png",
  officeWindow: "/assets/scenery/office-window.png",
  signalBeacon: "/assets/scenery/signal-beacon.png",
  antenna: "/assets/scenery/antenna.png",
} as const;

const createImage = (src: string) => {
  const image = new Image();
  image.src = src;
  return image;
};

export const createGameAssets = (): GameAssets => ({
  scout: createImage(assetPaths.scout),
  zombie: createImage(assetPaths.zombie),
  cyclops: createImage(assetPaths.cyclops),
  backdropWarm: createImage(assetPaths.backdropWarm),
  backdropCool: createImage(assetPaths.backdropCool),
  platformLeft: createImage(assetPaths.platformLeft),
  platformMiddle: createImage(assetPaths.platformMiddle),
  platformRight: createImage(assetPaths.platformRight),
  officeWindow: createImage(assetPaths.officeWindow),
  signalBeacon: createImage(assetPaths.signalBeacon),
  antenna: createImage(assetPaths.antenna),
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
  scout: {
    left: { x: 0, y: 16, width: 32, height: 48 },
    down: { x: 32, y: 16, width: 32, height: 48 },
    right: { x: 64, y: 16, width: 32, height: 48 },
    up: { x: 96, y: 16, width: 32, height: 48 },
  },
  zombieIdle: { x: 0, y: 20, width: 32, height: 44 },
  cyclopsIdle: { x: 0, y: 32, width: 32, height: 32 },
} as const;
