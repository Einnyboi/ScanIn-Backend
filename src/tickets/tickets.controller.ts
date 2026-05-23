import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import type { CorrectionTicketDto } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Put()
  replaceAll(@Body() tickets: CorrectionTicketDto[]) {
    return this.ticketsService.replaceAll(tickets);
  }

  @Post()
  create(@Body() ticket: CorrectionTicketDto) {
    return this.ticketsService.create(ticket);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() ticket: CorrectionTicketDto) {
    return this.ticketsService.update(id, ticket);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
