import type { Note } from "./types";

/**
 * Short engineering notes. Each one is a decision that was actually made in a
 * shipped system, written up with the reasoning and the cost rather than as a
 * tutorial.
 */
export const notes: Note[] = [
  {
    slug: "pooling-chromium",
    title: "200 browser launches, or one",
    dek: "Pooling a headless browser fixed the timeouts. It also taught me I had put a browser somewhere it did not belong.",
    readingTime: "3 min",
    context: "Shramik Sathi · payslip rendering",
    body: [
      {
        heading: "The symptom",
        body: [
          "Payslip generation timed out for larger establishments. Not always, and not at a clean threshold — which is usually a sign that the failure is about contention rather than about size.",
          "The implementation was the obvious one: render a payslip to PDF by launching a headless Chromium, loading an HTML template, printing it, and closing the browser. For a 200-worker establishment that is 200 launches in a single run. Each launch is a process spawn, a V8 initialisation and a renderer warm-up, and they were all competing for the same small EC2 box that also runs the API.",
        ],
      },
      {
        heading: "The fix, and why it was the easy part",
        body: [
          "Pooling the browser — keeping one instance alive and opening a page per document instead of a process per document — took 200 launches to 1 for that run. The timeouts stopped immediately.",
          "This is a satisfying diff and a small one. It is also the least interesting part of the story, because the measurement that made it obvious took longer than the change: per-document timing showed the cost was almost entirely in launch, not in render.",
        ],
      },
      {
        heading: "What the fix did not solve",
        body: [
          "A pooled browser is still a browser. It is a long-lived, stateful, memory-hungry dependency sitting on the critical path of a document that an inspector can legally demand. A leaked page handle becomes a memory problem hours later. A crashed instance takes the whole pool with it, so the pool needs a supervisor, which is more moving parts than the thing it replaced.",
          "I accepted that because the alternative was a rewrite and the timeouts were live. But the honest conclusion is that Chromium was the wrong tool from the start: the 11 statutory registers have legally prescribed layouts. They are fixed tables. They do not need a rendering engine — they need a typed PDF writer that emits the layout directly.",
        ],
      },
      {
        heading: "The generalisation",
        body: [
          "HTML-to-PDF is the default because it lets you reuse a template you already have. That reuse is real, and it is worth it when layouts change often or are designed by someone who works in CSS.",
          "When the layout is prescribed by statute and will not change until the statute does, you are paying a browser's operational cost to avoid writing a table renderer once. Pooling makes that trade survivable. It does not make it correct.",
        ],
      },
    ],
  },

  {
    slug: "always-on-cost",
    title: "The cheapest worker is the one that is not running",
    dek: "Two systems, two ways of removing always-on infrastructure — and the signal each one cost me.",
    readingTime: "4 min",
    context: "SupportPilot and Shramik Sathi · infrastructure",
    body: [
      {
        heading: "Celery to cron",
        body: [
          "SupportPilot started with Celery. It is the right answer for a lot of Python systems and it was not obviously wrong here: background work existed, and Celery handles background work.",
          "But a Celery worker is a process that runs whether or not there is anything to do, and it bills for that. On a personal project with bursty, low-volume background work, idle cost was most of the bill. Replacing it with cron-driven jobs removed always-on infrastructure from the system entirely.",
        ],
      },
      {
        heading: "What I gave up",
        body: [
          "A queue answers a question cron cannot: how far behind am I? Queue depth is a backpressure signal and an alerting primitive at the same time. If work arrives faster than it is processed, the queue tells you, and it tells you before users notice.",
          "Cron has no equivalent. A cron job that is taking longer than its interval just overlaps itself, and the only way I find out is by looking. At current volume that is a fine trade. It is also a trade with an expiry date: the moment ingest becomes bursty, the design loses the ability to report that it is struggling.",
        ],
      },
      {
        heading: "Redis on the box",
        body: [
          "Shramik Sathi runs the opposite version of the same decision. There the queue is load-bearing — payroll, exports and PDF rendering all go through BullMQ — so removing it was never on the table. The question was where it runs.",
          "Managed ElastiCache is the default and it is genuinely better: separate failure domain, managed failover, no memory contention with the API. It also costs ₹1,320/month more than running Redis as one of the five containers on the EC2 host that was already paid for.",
        ],
      },
      {
        heading: "Why co-locating was defensible there and would not be elsewhere",
        body: [
          "The argument is not that ₹1,320 is a lot of money. It is that the durability the managed service buys is durability this queue does not need. Every job in it is idempotent and re-derivable from attendance data in RDS. If the host dies, the queue dies with it, and the recovery procedure is to run the jobs again.",
          "That property is what makes the saving free rather than borrowed. The day a job holds the only copy of something — an external side effect, an unrecoverable state transition — the same decision becomes a way of losing data to save ₹1,320, and I would move it.",
        ],
      },
      {
        heading: "The thing I would tell myself earlier",
        body: [
          "Both of these are cost decisions that are really durability decisions in disguise. The question is never 'can I run this more cheaply'. It is 'what does this component have to survive, and what happens the first time it does not'.",
          "When the answer is 'we re-run it', cheap is correct. When the answer is 'we lose something', the saving is a loan against an incident.",
        ],
      },
    ],
  },

  {
    slug: "designing-for-at-least-once",
    title: "Duplicates are not a bug to prevent",
    dek: "At-least-once delivery guarantees you will process the same event twice. The useful response is to make that boring.",
    readingTime: "4 min",
    context: "AgentLens · trace ingestion",
    body: [
      {
        heading: "The guarantee you actually get",
        body: [
          "AgentLens ingests agent traces through Redis Streams with consumer groups. That gives at-least-once delivery: a message is redelivered if it was not acknowledged, and a worker that dies mid-processing did not acknowledge.",
          "Worker restarts are not an edge case. They are deploys, they are scaling events, they are OOM kills. In normal operation this system will see the same event more than once, repeatedly, forever.",
        ],
      },
      {
        heading: "Where I chose to solve it",
        body: [
          "There are two places to put the fix. You can chase exactly-once at the transport layer, with deduplication windows and delivery state, or you can accept redelivery and make processing idempotent.",
          "I put it in the database. Unique constraints define what makes a trace event the same event, and ON CONFLICT upserts turn a replay into a no-op instead of an error. The correctness argument reduces to one sentence: processing an event twice produces the same rows as processing it once.",
        ],
      },
      {
        heading: "The pieces that make that hold",
        body: [
          "Idempotent writes alone are not enough. SIGTERM draining lets a worker acknowledge what it has already finished before it exits, which cuts the volume of redelivery rather than just tolerating it.",
          "Dead-letter queues handle the other half. An event that fails repeatedly is not a transient problem, and retrying it forever converts one poison message into a stalled consumer. Capturing it keeps the stream moving and keeps the failure visible.",
          "312 tests in CI assert these specific properties, because they are exactly the kind of guarantee that regresses silently. Nothing breaks visibly when idempotency stops holding — you just get duplicate rows that nobody notices until a number is wrong.",
        ],
      },
      {
        heading: "The cost",
        body: [
          "Every event now pays an index cost on write, and the deduplication load sits on PostgreSQL rather than on the transport. That is a real throughput ceiling and it is where this design will break first.",
          "I took it because a correctness property you can state in one sentence is worth more than one that is distributed across a transport layer's configuration. The version I can test is the version I can trust.",
        ],
      },
      {
        heading: "What I would still change",
        body: [
          "The weakest part is not duplicates — it is the opposite failure. Redis Streams retention is memory-bound, so a consumer that falls far enough behind combined with stream trimming produces silent data loss. No error is raised, because from Redis's point of view trimming is normal.",
          "That makes consumer lag the metric that actually matters, and it deserves to be an alert rather than a dashboard number. Tiering cold traces to object storage behind the same read API would take retention off the memory budget entirely.",
        ],
      },
    ],
  },
];

export const noteBySlug = (slug: string): Note | undefined => notes.find((note) => note.slug === slug);
