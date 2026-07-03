import { TestBed } from '@angular/core/testing';
import { PhotoService } from './photo'; // Changed from Photo to PhotoService

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoService); // Changed here too
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});