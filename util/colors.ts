import type { TupleToUnion } from 'type-fest'
// @ts-ignore
import NearestColor from 'nearest-rgba'

const colorList = [
	['red', '#ff0000'],
	['orange', '#ffa500'],
	['yellow-orange', '#ffae42'],
	['yellow', '#ffff00'],
	['yellow-green', '#9acd32'],
	['green', '#008000'],
	['blue-green', '#0d98ba'],
	['aqua', '#00ffff'],
	['blue', '#0000ff'],
	['indigo', '#4b0082'],
	['purple', '#800080'],
	['magenta', '#ff00ff'],
	['hot-pink', '#ff69b4'],
	['pink', '#ffc0cb'],
	['cool-gray', '#808080'],
] as const
const nc = new NearestColor()
const colorHex: string[] = []
const colorMap = new Map<string, ColorList>()
colorList.forEach((entry) => {
	const [name, hex] = entry
	colorHex.push(hex)
	colorMap.set(name, hex)
	colorMap.set(hex, name)
})
nc.fromHEX(colorHex)

export const convertColor: ConvertColor = (color) => {
	if (!colorMap.get(color)) return colorMap.get(nc.nearest(color, true))

	return colorMap.get(color)
}

type ColorList = TupleToUnion<TupleToUnion<typeof colorList>>
export type AsanaColors = typeof colorList[number][0]

type ConvertColor = (color: ColorList | string) => ColorList | undefined
