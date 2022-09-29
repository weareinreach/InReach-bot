import { IncomingHttpHeaders } from 'http'

declare module 'http' {
	interface IncomingHttpHeaders {
		'x-zm-signature'?: string
		'x-zm-request-timestamp'?: string
	}
}
