import { NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';
import { environment } from '../environments/environment';

export class LoggerMonitor implements NGXLoggerMonitor {
  onLog(log: NGXLogInterface) {
    log['app'] = environment.loggerConf.app
  }
}
