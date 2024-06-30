import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ConnectWalletDialogComponent } from './connect-wallet.component'

describe('ConnectWalletDialogComponent', () => {
  let component: ConnectWalletDialogComponent
  let fixture: ComponentFixture<ConnectWalletDialogComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectWalletDialogComponent],
    })
    fixture = TestBed.createComponent(ConnectWalletDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
