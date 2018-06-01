import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/routing';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { CoreComponentsModule } from './core-services/core-components.module';
import { CoreServicesModule } from './core-services/core-services.module';
import { CoreUtilsModule } from './core-services/core-utils.module';
import { HomeModule } from './home/home.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ]),
    BrowserModule,
    BrowserAnimationsModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    HomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
