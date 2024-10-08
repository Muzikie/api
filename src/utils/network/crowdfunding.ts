/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowdfunding.json`.
 */
export type Crowdfunding = {
  "address": "3zkoTzTLyfPGhzCXWyfdt4Y3pfaNKCf8R8DBNunxDSvA",
  "metadata": {
    "name": "crowdfunding",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addContributionTier",
      "discriminator": [
        73,
        127,
        230,
        94,
        219,
        188,
        84,
        209
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tierId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tierId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizeProject",
      "discriminator": [
        161,
        232,
        117,
        5,
        108,
        131,
        145,
        232
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "appAddress",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initProject",
      "discriminator": [
        40,
        78,
        156,
        122,
        54,
        85,
        204,
        46
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "projectId"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "softCap",
          "type": "u64"
        },
        {
          "name": "hardCap",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        },
        {
          "name": "appAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "refund",
      "discriminator": [
        2,
        96,
        183,
        251,
        63,
        208,
        46,
        46
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setPublish",
      "discriminator": [
        150,
        37,
        197,
        176,
        219,
        63,
        208,
        161
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "projectState",
      "discriminator": [
        41,
        49,
        200,
        239,
        125,
        191,
        219,
        242
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "projectNotInDraft",
      "msg": "The project is not in Draft state."
    },
    {
      "code": 6001,
      "name": "projectNotPublished",
      "msg": "The project is not Published."
    },
    {
      "code": 6002,
      "name": "deadlinePassed",
      "msg": "The project's deadline has passed."
    },
    {
      "code": 6003,
      "name": "deadlineNotPassed",
      "msg": "The project's deadline Not passed."
    },
    {
      "code": 6004,
      "name": "hardCapReached",
      "msg": "The project has reached the hard cap."
    },
    {
      "code": 6005,
      "name": "softCapNotReached",
      "msg": "The soft cap has not been reached."
    },
    {
      "code": 6006,
      "name": "deadlineNotReached",
      "msg": "The project's deadline has not been reached."
    },
    {
      "code": 6007,
      "name": "projectNotFailing",
      "msg": "The project is not in Failing state."
    },
    {
      "code": 6008,
      "name": "projectFailed",
      "msg": "The project has failed."
    },
    {
      "code": 6009,
      "name": "noContributionTiers",
      "msg": "The project must have at least one contribution tier."
    },
    {
      "code": 6010,
      "name": "maxContributionTiersReached",
      "msg": "The project already has the maximum number of contribution tiers."
    },
    {
      "code": 6011,
      "name": "tierNotFound",
      "msg": "The contribution tier was not found."
    },
    {
      "code": 6012,
      "name": "incorrectAmount",
      "msg": "The contribution amount does not match the required tier amount."
    },
    {
      "code": 6013,
      "name": "insufficientFunds",
      "msg": "The project account does not have enough funds."
    }
  ],
  "types": [
    {
      "name": "contributionTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tierId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "projectState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "softCap",
            "type": "u64"
          },
          {
            "name": "hardCap",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "currentFunding",
            "type": "u64"
          },
          {
            "name": "contributionTiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "contributionTier"
                }
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "projectStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "projectStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "published"
          },
          {
            "name": "successful"
          },
          {
            "name": "soldOut"
          },
          {
            "name": "failed"
          },
          {
            "name": "failing"
          }
        ]
      }
    }
  ]
};
