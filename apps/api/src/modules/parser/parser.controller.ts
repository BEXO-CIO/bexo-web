import { Controller, Post, Get, Param, Sse, UseInterceptors, UploadedFile, Req, UseGuards, MessageEvent } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from './parser.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Observable, interval } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';

@Controller('resume')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @Req() request: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = request.user.userId;
    return this.parserService.handleResumeUpload(userId, file);
  }

  @Sse('status/:jobId')
  statusStream(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(async () => {
        const { status, result } = await this.parserService.getJobStatus(jobId);
        return { status, result };
      }),
      map((data) => {
        return { data } as MessageEvent;
      }),
      // Continue emitting until status is 'completed' or 'failed'
      takeWhile((event: any) => {
        const status = event.data?.status;
        return status !== 'completed' && status !== 'failed';
      }, true) // Emit the terminating event too
    );
  }
}
