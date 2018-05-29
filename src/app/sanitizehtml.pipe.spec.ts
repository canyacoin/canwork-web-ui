import { SanitizehtmlPipe } from './sanitizehtml.pipe';

describe('SanitizehtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new SanitizehtmlPipe();
    expect(pipe).toBeTruthy();
  });
});
