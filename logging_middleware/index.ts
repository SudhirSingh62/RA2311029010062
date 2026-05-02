export type LogStack = 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackageFrontend = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';

export interface LoggerConfig {
  token: string;
  baseUrl: string;
}

const ALLOWED_STACKS = new Set(['frontend']);
const ALLOWED_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const ALLOWED_PKGS = new Set(['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils']);

let currentToken = '';
let targetEndpoint = 'http://20.207.122.201/evaluation-service';

export function initializeLogger(config: LoggerConfig): void {
  if (config.token) currentToken = config.token;
  if (config.baseUrl) targetEndpoint = config.baseUrl.replace(/\/$/, '');
}

export async function Log(stack: LogStack, level: LogLevel, pkg: LogPackageFrontend, message: string): Promise<{ ok: boolean; error?: string; data?: any }> {
  if (!ALLOWED_STACKS.has(stack)) return { ok: false, error: 'Invalid stack provided' };
  if (!ALLOWED_LEVELS.has(level)) return { ok: false, error: 'Invalid level provided' };
  if (!ALLOWED_PKGS.has(pkg)) return { ok: false, error: 'Invalid package provided' };

  try {
    const finalUrl = targetEndpoint.includes('/evaluation-service') 
      ? `${targetEndpoint}/logs` 
      : `${targetEndpoint}/evaluation-service/logs`;

    const res = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    if (!res.ok) {
      return { ok: false, error: `Logger network error ${res.status}` };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Unknown network error' };
  }
}
