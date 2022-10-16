export const asanaBlockRegex = /(<!--Asana:\d+-->.*<!--\/Asana-->)/gis

export const asanaTaskNoBlockRegex =
	/^(?<!<!--Asana:\d-->)\[?(Asana-\d+)\]?(?!<!--\/Asana-->)/gi

export const bodyTagsRegex = /(<[\/]?body>)/gi

export const extractTaskFromBlock = /<!--Asana:(\d+)-->/

export const githubIssueRegex =
	/http[s]?:\/\/[.*\.]?github\.com\/[a-z-0-9]*\/[a-z0-9-_.]*\/issues\/\d+/gi

export const githubPullRegex =
	/http[s]?:\/\/[.*\.]?github\.com\/[a-z-0-9]*\/[a-z0-9-_.]*\/pull\/\d+/gi

export const githubPrExtractRegex =
	// /http[s]?:\/\/[.*\.]?github\.com\/([a-z-0-9]*)\/([a-z0-9-_.]*)\/pull\/(\d+)/gi
	/http[s]?:\/\/[.*\.]?github\.com\/(?<owner>[a-z-0-9]*)\/(?<repo>[a-z0-9-_.]*)\/pull\/(?<pr>\d+)/gi

export const htmlRegex = {
	/* A regex that matches HTML comments. */
	comment: /(<!--.*-->\n?)/gi,
	/* It's a regex that matches HTML paragraph tags. */
	paragraph: /(<\/?p>)/gi,
	/* It's a regex that matches HTML comments, paragraph tags, and pre tags. */
	strip: /(<!--.*-->\n?)|(<\/?p>)|(<\/?pre>)/gi,
	/* It's a regex that matches HTML heading tags. */
	heading: /(<\/?)h\d{1}(>)/gi,
	/* It's a regex that matches HTML image tags. */
	image: /(?:<img .*src=")(http[^"]*)(?:.*\/>)/gi,
}
