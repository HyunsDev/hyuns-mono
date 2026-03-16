import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AccessTokenPayload } from '@workspace/primitive';

import { SseConnectionService } from './sse-connection.service';

import { Auth, Token } from '@/modules/security';

@Auth()
@Controller('sse')
export class SseHttpController {
  constructor(private readonly sseService: SseConnectionService) {}

  @Sse('stream')
  stream(@Token() token: AccessTokenPayload): Observable<unknown> {
    return this.sseService.subscribe(token.sub, token.sid);
  }
}
