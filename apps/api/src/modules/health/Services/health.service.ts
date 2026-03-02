import { APP_NAME } from '@belearning/utils';

export class HealthService {
  getStatus(): { status: string; app: string; timestamp: string } {
    return {
      status: 'ok',
      app: APP_NAME,
      timestamp: new Date().toISOString(),
    };
  }
}
