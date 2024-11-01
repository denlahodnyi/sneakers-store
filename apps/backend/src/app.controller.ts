import { Controller, Get } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { contract as c } from '@sneakers-store/contracts';

@Controller()
export class AppController {
  @Get()
  @TsRestHandler(c.getRoot)
  async getRoot() {
    return tsRestHandler(c.getRoot, async () => {
      return { status: 200, body: { status: 'success' } };
    });
  }
}
