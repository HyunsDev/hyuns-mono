/* eslint-disable turbo/no-undeclared-env-vars */
/**
 *            _____________
 *           /             \
 *          /    R I P      \
 *         |                |
 *         |  OpenTelemetry |
 *         |                |
 *         |  "Too heavy    |
 *         |   for now."    |
 *         |                |
 *         |  2025 - ?      |
 *         |                |
 *         |________________|
 *
 *
 * 만들다가 포기했습니다... 나중에 다시 도전해볼게요...
 */

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 1. 설정값 정의 (환경변수나 기본값 사용)
const serviceName = process.env.OTEL_SERVICE_NAME || 'unibook-api';
const serviceVersion = '1.0.0';
const exporterEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

// 2. Exporter 설정
const traceExporter = new OTLPTraceExporter({
  url: exporterEndpoint,
});

// 3. SDK 인스턴스 생성
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-http': { enabled: true },
    }),
    new PrismaInstrumentation(),
  ],
});

// 4. [핵심] 즉시 실행
try {
  sdk.start();
  console.log(`🚀 [Backend-Core] OpenTelemetry initialized via ${exporterEndpoint}`);
} catch (error) {
  console.error('Error initializing OpenTelemetry SDK', error);
}

// 5. 종료 처리 등록
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

console.log(
  `🚀 [Backend-Core] OpenTelemetry initialized (${process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT})`,
);
