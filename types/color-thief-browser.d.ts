declare module 'color-thief-browser' {
  interface ColorThief {
    getColor: (image: HTMLImageElement | HTMLCanvasElement) => [number, number, number]
    getPalette: (image: HTMLImageElement | HTMLCanvasElement, colorCount?: number) => [number, number, number][]
  }

  export default class ColorThiefClass {
    getColor: ColorThief['getColor']
    getPalette: ColorThief['getPalette']
  }
}