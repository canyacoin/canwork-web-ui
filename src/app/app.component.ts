import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { NGXLogger } from 'ngx-logger';
import { UUID } from 'angular2-uuid';
import { HttpHeaders } from '@angular/common/http';
import { LoggerMonitor } from './log.wrapper';
import { AngularFireAuth } from 'angularfire2/auth';

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
    // config logger by auth state
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Auth-Token': UUID.UUID(),
    });
    this.logger.setCustomHttpHeaders(headers);

    this.logger.error('test public');

    this.afAuth.authState.subscribe(async(auth) => {
      if (auth) {
        const jwtToken = await auth.getIdToken(true);
        this.logger.setCustomHttpHeaders(new HttpHeaders({'Authorization': jwtToken}));
        this.logger.updateConfig({
          ...this.logger.getConfigSnapshot(),
          // serverLoggingUrl: 'http://127.0.0.1:8080/log/private',
          serverLoggingUrl: 'https://canya-api-gae-stackdriver-logging-proxy-dot-staging-can-work.appspot.com/log/private'
        });

        this.logger.error('test login private');
      } else {
        this.logger.setCustomHttpHeaders(headers);
        this.logger.updateConfig({
          ...this.logger.getConfigSnapshot(),
          // serverLoggingUrl: 'http://127.0.0.1:8080/log/public',
          serverLoggingUrl: 'https://canya-api-gae-stackdriver-logging-proxy-dot-staging-can-work.appspot.com/log/public'
        });

        this.logger.error('test log out public');
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
