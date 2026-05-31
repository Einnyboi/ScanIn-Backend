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

type CorrectionTicketDto = {
  studentId: string;
  reason: string;
  date: string;
  status?: string;
};

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Put()
  replaceAll() {
    return this.ticketsService.replaceAll();
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
