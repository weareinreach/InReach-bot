import pino from 'pino'
// @ts-expect-error
import nrPino from '@newrelic/pino-enricher'

export const logger = pino(nrPino())
