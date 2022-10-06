const { withSentryConfig } = require('@sentry/nextjs')

if (process.env.CI !== '1') {
	// @ts-ignore
	require('@newrelic/next')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,

	// Optional build-time configuration options
	sentry: {
		// See the 'Configure Source Maps' and 'Configure Legacy Browser Support'
		// sections below for information on the following options:
		//   - disableServerWebpackPlugin
		//   - disableClientWebpackPlugin
		//   - autoInstrumentServerFunctions
		//   - hideSourceMaps
		//   - widenClientFileUpload
		//   - transpileClientSDK
		autoInstrumentServerFunctions: true,
		hideSourceMaps: true,
	},
}
const sentryWebpackPluginOptions = {
	// Additional config options for the Sentry Webpack plugin. Keep in mind that
	// the following options are set automatically, and overriding them is not
	// recommended:
	//   release, url, org, project, authToken, configFile, stripPrefix,
	//   urlPrefix, include, ignore

	silent: true, // Suppresses all logs
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
