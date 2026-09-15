# Crum Architecture

```text
              EVENT SOURCES / FLYERS
                        |
                        v
               Amazon Bedrock Vision
                        |
                        v
               EVENT NORMALIZATION
                        |
                        v
                 DYNAMODB STATE
                        |
                        v
               STRANDS AGENT
             /        |        \
            /         |         \
      DISCOVER     MATCHING   MONITORING
            \         |         /
             \        |        /
              v       v       v
                 EVENTBRIDGE
                      |
                      v
                STEP FUNCTIONS
                      |
                      v
               HUMAN APPROVAL
                      |
                      v
            BOOK / CALENDAR / ACTION
                      |
                      v
                VERIFICATION
                      |
                      v
             CONTINUED MONITORING
```

The local MVP mirrors this workflow with deterministic functions so the demonstration can be run without external credentials.
