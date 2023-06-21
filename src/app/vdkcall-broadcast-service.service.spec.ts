import { TestBed } from '@angular/core/testing';

import { VdkcallBroadcastServiceService } from './shared/services/vdkcall-broadcast-service.service';

describe('VdkcallBroadcastServiceService', () => {
  let service: VdkcallBroadcastServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VdkcallBroadcastServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
