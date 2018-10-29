import { NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';

export class LoggerMonitor implements NGXLoggerMonitor {
  onLog(log: NGXLogInterface) {
    // TODO: read from config
    log['app'] = 'canwork';
  }
}
