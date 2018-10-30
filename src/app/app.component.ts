import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { NGXLogger } from 'ngx-logger';
import { UUID } from 'angular2-uuid';
import { HttpHeaders } from '@angular/common/http';
import { LoggerMonitor } from './log.wrapper';
import { AngularFireAuth } from 'angularfire2/auth';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private logger: NGXLogger) {
    afs.firestore.settings({timestampsInSnapshots: true});
    afs.firestore.enablePersistence();

    // register logger
    this.logger.registerMonitor(new LoggerMonitor())

    // config logger default
    const defaultLogConfig = this.logger.getConfigSnapshot();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Auth-Token': UUID.UUID(),
    });
    this.logger.setCustomHttpHeaders(headers);

    this.logger.error('test /log/public');

    // config logger by auth state
    this.afAuth.authState.subscribe(async(auth) => {
      if (auth) {
        const jwtToken = await auth.getIdToken(true);
        this.logger.setCustomHttpHeaders(new HttpHeaders({'Authorization': jwtToken}));
        this.logger.updateConfig({
          ...defaultLogConfig,
          serverLoggingUrl: environment.loggerConf.serverUrl  + '/log/private'
        });

        this.logger.error('test /log/private when login');
      } else {
        this.logger.setCustomHttpHeaders(headers);
        this.logger.updateConfig({
          ...defaultLogConfig,
          serverLoggingUrl: environment.loggerConf.serverUrl + '/log/public'
        });

        this.logger.error('test /log/public when logout');
      }
    });
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }
}
