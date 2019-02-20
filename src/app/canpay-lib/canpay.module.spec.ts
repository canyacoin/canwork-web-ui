import { CanpayModule } from './canpay.module';

describe('CanpayModule', () => {
  let canpayModule: CanpayModule;

  beforeEach(() => {
    canpayModule = new CanpayModule();
  });

  it('should create an instance', () => {
    expect(canpayModule).toBeTruthy();
  });
});
