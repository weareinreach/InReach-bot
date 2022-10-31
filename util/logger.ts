import pino from "pino";
import nrPino from '@newrelic/pino-enricher'

export const logger = pino(nrPino())