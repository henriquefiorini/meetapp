import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import ResetPasswordMail from '../app/jobs/ResetPasswordMail';
import SubscriptionMail from '../app/jobs/SubscriptionMail';
import UnsubscriptionMail from '../app/jobs/UnsubscriptionMail';

const jobs = [ResetPasswordMail, SubscriptionMail, UnsubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        queue: new Bee(key, { redis: redisConfig }),
        handle,
      };
    });
  }

  add(jobKey, data) {
    return this.queues[jobKey].queue.createJob(data).save();
  }

  process() {
    jobs.forEach(job => {
      const { queue, handle } = this.queues[job.key];
      queue.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
