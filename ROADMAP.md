# Roadmap:
- [X] Runtime jobs for continuous scraping.
- [X] Deal with timeouts, adjust timeouts to be 75% of the time difference between any 2 scrapes.
- [X] Write to MongoDB.
- [X] Handle errors and non-200 responses.
- [X] Multiple selectors.
- [X] New Mongodb collection every week or so.
- [X] Deal with timeout error callbacks.
- [X] Deal for when there exists many instances of a selector.
- [] Validation of json format before everything else.

- [] Intercept items such as imgs/graphs/ and heavy stuff to not load unless they are being queried.
- [] Specify the blockage of some domains.
- [] Proxy calls through different servers to limit rate limiting over a certain threshold.