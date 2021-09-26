import { TestBed, async, inject } from '@angular/core/testing';

import { BookieGuard } from './bookie.guard';

describe('BookieGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookieGuard]
    });
  });

  it('should ...', inject([BookieGuard], (guard: BookieGuard) => {
    expect(guard).toBeTruthy();
  }));
});
