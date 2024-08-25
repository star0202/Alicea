import { CronJob } from 'cron'

export default class CronManager {
  private jobs: CronJob[] = []

  add(config: { cronTime: string; onTick: () => void }) {
    this.jobs.push(
      new CronJob({ ...config, timeZone: 'Asia/Seoul', start: true }),
    )
  }
}
