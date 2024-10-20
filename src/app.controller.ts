import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Sign-up using credebl(get info, register and send VC on did), also return token(containing did)
  // Login: get presentation from adeya and verify against credebl
  // Post: Add file: to pinata
  // Get: get file from pinata

  /**
   * Utilities
   * 1. (Put)Associate name to did(name + did)
   * 2. (Get)Did/name-find people from platform from name or DID. So that u can add them to files to be shared
   * 3. (Put) Share to-share file to the person(Using did or name)
  */
}
