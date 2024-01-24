import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginComponent } from './login/login.component'
// Import library module for spinner
import { NgxSpinnerModule } from 'ngx-spinner'

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes), NgxSpinnerModule],
  exports: [RouterModule, NgxSpinnerModule],
})
export class AuthRoutingModule {}
