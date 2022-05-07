<div align="center">
<h1>Service Warranty Reminder 📅</h1>

<p>A project that sends notifications when a certificate is due to expire.</p>
</div>

<hr />

## What is this?

This project takes reads a Google Sheet, parses the expiry date of a given certificate and sends email notifications when it is due to expire. This is a simple project that was only designed for me, but if you wish to use it feel free to.

## Tech stack

This is a [Serverless](https://www.serverless.com/) project written in TypeScript that deploys a Lambda to AWS. It runs on a schedule of once a day. It uses [SparkPost](https://www.sparkpost.com/) to send email notifications.

## How does it work

It reads a Google Sheet in the following format:

| Property | Certificate Type | Expiry Date | Link        |
|----------|------------------|-------------|-------------|
| Foo      | Washing Machine  | 28-Mar-2031 | https://xxx |

And determines if a notification should be sent. A notification is sent if the certificate is expiring in either 14, 7 or 2 days time or if it has already expired.

## License

[MIT](LICENSE)
