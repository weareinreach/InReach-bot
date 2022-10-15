export const asanaBlockRegex = /(<!--Asana:\d+-->.*<!--\/Asana-->)/gis

export const asanaTaskNoBlockRegex =
	/^(?<!<!--Asana:\d-->)\[?(Asana-\d+)\]?(?!<!--\/Asana-->)/gi

export const bodyTagsRegex = /(<[\/]?body>)/gi

export const extractTaskFromBlock = /<!--Asana:(\d+)-->/

export const githubIssueRegex =
	/http[s]?:\/\/[.*\.]?github.com\/[a-z-0-9]*\/[a-z0-9-_.]*\/issues\/\d+/gi

export const htmlRegex = {
	comment: /(<!--.*-->\n?)/gi,
	paragraph: /(<\/?p>)/gi,
	strip: /(<!--.*-->\n?)|(<\/?p>)|(<\/?pre>)/gi,
	heading: /(<\/?)h\d{1}(>)/gi,
	image: /(?:<img .*src=")(http[^"]*)(?:.*\/>)/gi,
}
