import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { containerDetector } from '@opentelemetry/resource-detector-container'
import {
  type Resource,
  detectResources,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

class Instrumentation {
  private static sdk: NodeSDK | null = null

  static getResource(serviceName: string, serviceVersion: string): Resource {
    const environment = process.env.APP_ENV || 'local'

    const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment'
    const baseResource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
      [ATTR_DEPLOYMENT_ENVIRONMENT]: environment,
    })

    const autoDetectedResource = detectResources({
      detectors: [processDetector, hostDetector, containerDetector, osDetector, envDetector],
    })

    return baseResource.merge(autoDetectedResource)
  }

  static start(otlpEndpointUrl: string, resource: Resource): void {
    if (Instrumentation.sdk) {
      return
    }

    const otlpEndpointUrlWithScheme = otlpEndpointUrl.startsWith('http')
      ? otlpEndpointUrl
      : `http://${otlpEndpointUrl}`

    const spanProcessors = [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${otlpEndpointUrlWithScheme}/v1/traces`,
        })
      ),
    ]
    const metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otlpEndpointUrlWithScheme}/v1/metrics`,
      }),
      exportIntervalMillis: 15000,
    })
    const logRecordProcessors = [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${otlpEndpointUrlWithScheme}/v1/logs`,
        })
      ),
    ]

    const textMapPropagator = new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    })

    Instrumentation.sdk = new NodeSDK({
      resource,
      spanProcessors,
      metricReader,
      logRecordProcessors,
      textMapPropagator,
    })

    console.log(`OTEL SDK starting with endpoint: ${otlpEndpointUrlWithScheme}`)
    Instrumentation.sdk.start()
  }

  static async shutdown() {
    if (Instrumentation.sdk) {
      await Instrumentation.sdk.shutdown()
      Instrumentation.sdk = null
      console.log('OTEL SDK shutdown successfully')
    }
  }
}

process.on('SIGTERM', () => {
  void Instrumentation.shutdown()
})

export function register() {
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (otlpEndpoint) {
    const resource = Instrumentation.getResource('proseed-web', '0.1.0')
    Instrumentation.start(otlpEndpoint, resource)
  }
}
