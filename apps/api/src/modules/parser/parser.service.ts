import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException } from '@nestjs/common';
import { Queue, Worker, ConnectionOptions } from 'bullmq';
import { RedisService } from '../auth/redis.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;
  private worker: Worker;
  private redisConnection: ConnectionOptions;
  private readonly uploadDir = path.join(__dirname, '../../../../temp-resumes');

  constructor(private readonly redis: RedisService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    // ioredis connection options can be passed to BullMQ directly
    this.redisConnection = {
      connectionString: redisUrl,
    } as any;
  }

  onModuleInit() {
    // Ensure local temporary directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Initialize BullMQ Queue
    this.queue = new Queue('resume-parsing', {
      connection: this.redisConnection,
    });

    // Initialize BullMQ Worker
    this.worker = new Worker(
      'resume-parsing',
      async (job) => {
        const { fileHash, jobId } = job.data;
        console.log(`[Parser Worker] Processing resume job: ${jobId}`);

        // 1. Mark status as parsing
        await this.redis.set(`resume:status:${jobId}`, 'parsing', 3600);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate OCR/GPT latency

        // 2. Mock AI parsed profile data matching Part 10.1 and Step 6 manual sections
        const parsedProfile = {
          headline: 'Full Stack Engineer Intern',
          career_goal: 'To build high-performance distributed systems in a fast-paced environment.',
          bio: 'CS Student at PSG Tech. Active open-source contributor and monorepo advocate.',
          sections: {
            education: [
              { degree: 'B.E. Computer Science', college: 'PSG College of Technology', year: '2026', cgpa: '9.1' }
            ],
            projects: [
              { title: 'BEXO Web App', description: 'Student portfolio monorepo scaffolding.', tech_stack: ['NestJS', 'React', 'TypeScript'] }
            ],
            experience: [
              { role: 'Backend Intern', company: 'TechSolutions Corp', dates: 'May 2025 - July 2025', responsibilities: 'Optimized DB queries and configured Redis caching.' }
            ],
            certificates: [
              { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2025' }
            ],
            achievements: [
              { awards: 'First Place - Smart India Hackathon 2025' }
            ],
            research: [
              { papers: 'Optimizing Node.js microservices using shared memory queues.' }
            ],
            contact: [
              { public_email: 'kavin@democollege.edu', linkedin: 'https://linkedin.com/in/kavin', github: 'https://github.com/kavin' }
            ]
          }
        };

        // 3. Cache the results in Redis
        const resultString = JSON.stringify(parsedProfile);
        await this.redis.set(`resume:cache:${fileHash}`, resultString); // Long-lived cache for file deduplication
        await this.redis.set(`resume:result:${jobId}`, resultString, 3600); // 1-hour expiry for polling

        // 4. Mark status as completed
        await this.redis.set(`resume:status:${jobId}`, 'completed', 3600);
        console.log(`[Parser Worker] Finished resume job: ${jobId}`);
      },
      {
        connection: this.redisConnection,
      }
    );

    this.worker.on('failed', async (job, err) => {
      if (job) {
        console.error(`[Parser Worker] Job ${job.id} failed:`, err.message);
        await this.redis.set(`resume:status:${job.id}`, 'failed', 3600);
      }
    });
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
  }

  /**
   * Handle resume file uploads. Check SHA-256 cache.
   */
  async handleResumeUpload(userId: string, file: Express.Multer.File): Promise<{ cached: boolean; data?: any; jobId?: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload.');
    }

    // 1. Calculate SHA-256 hash of file buffer
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const cachedResult = await this.redis.get(`resume:cache:${hash}`);

    // 2. Return cached data immediately if it exists (Part 9.4)
    if (cachedResult) {
      console.log(`[Parser] Cache HIT for file hash: ${hash}`);
      return { cached: true, data: JSON.parse(cachedResult) };
    }

    // 3. Cache Miss: queue parsing job
    console.log(`[Parser] Cache MISS for file hash: ${hash}. Queueing job.`);
    const jobId = crypto.randomUUID();
    
    // Save file buffer to local directory representing GCS/MinIO storage
    const filePath = path.join(this.uploadDir, `${jobId}.pdf`);
    fs.writeFileSync(filePath, file.buffer);

    // Initial status: queued
    await this.redis.set(`resume:status:${jobId}`, 'queued', 3600);

    // Push job to BullMQ
    await this.queue.add('parse-resume', {
      userId,
      fileHash: hash,
      filePath,
      jobId,
    }, {
      jobId, // Set explicit jobId matching polling ID
    });

    return { cached: false, jobId };
  }

  async getJobStatus(jobId: string) {
    const status = await this.redis.get(`resume:status:${jobId}`);
    const resultStr = await this.redis.get(`resume:result:${jobId}`);
    const result = resultStr ? JSON.parse(resultStr) : null;
    return { status, result };
  }
}
