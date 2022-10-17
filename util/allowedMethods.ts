import type { NextApiRequest } from 'next'

export const allowedMethods = (methods: HTTPMethods[], req: NextApiRequest) => {
	if (methods.includes(req.method as HTTPMethods)) return true
	return false
}

type HTTPMethods =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'CONNECT'
	| 'OPTIONS'
	| 'TRACE'
	| 'PATCH'
