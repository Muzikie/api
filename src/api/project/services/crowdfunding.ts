/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowdfunding.json`.
 */
export type Crowdfunding = {
  "address": "6BsMtttdteCnV3b6XmxTiLS9VQfb57yu7cRH8SKfP4u3",
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
          "signer": true,
          "relations": [
            "project"
          ]
        }
      ],
      "args": [
        {
          "name": "tierId",
          "type": "u64"
        },
        {
          "name": "amount",
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
          "name": "tierId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
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
          "name": "walletAddress",
          "type": "pubkey"
        },
        {
          "name": "muzikieAddress",
          "type": "pubkey"
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
      "name": "hardCapReached",
      "msg": "The project has already reached its hard cap."
    },
    {
      "code": 6001,
      "name": "invalidContributionTier",
      "msg": "The contribution tier is invalid."
    },
    {
      "code": 6002,
      "name": "invalidContributionAmount",
      "msg": "The contribution amount is less than the minimum tier amount."
    },
    {
      "code": 6003,
      "name": "projectNotPublished",
      "msg": "The project is not published."
    },
    {
      "code": 6004,
      "name": "deadlinePassed",
      "msg": "The project deadline has passed."
    },
    {
      "code": 6005,
      "name": "incorrectAmount",
      "msg": "The contribution amount does not match the required tier amount."
    },
    {
      "code": 6006,
      "name": "projectNotInDraft",
      "msg": "Project is not in draft status."
    },
    {
      "code": 6007,
      "name": "noContributionTiers",
      "msg": "No contribution tiers available."
    },
    {
      "code": 6008,
      "name": "maxContributionTiersReached",
      "msg": "Maximum contribution tiers reached."
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "You are not authorized to add tiers."
    },
    {
      "code": 6010,
      "name": "projectNotFinalizable",
      "msg": "The project cannot be finalized, as it is not in a finalizable state."
    },
    {
      "code": 6011,
      "name": "contributorNotFound",
      "msg": "Contributor not found for refund."
    },
    {
      "code": 6012,
      "name": "deadlineNotPassed",
      "msg": "Deadline not passed."
    },
    {
      "code": 6013,
      "name": "projectNotReimbursable",
      "msg": "The project is not eligible for reimbursements."
    },
    {
      "code": 6014,
      "name": "noUnreimbursedContributions",
      "msg": "The contributor was not found or has no unreimbursed contributions."
    },
    {
      "code": 6015,
      "name": "insufficientFunds",
      "msg": "The project does not have sufficient funds for reimbursement."
    },
    {
      "code": 6016,
      "name": "tierNotFound",
      "msg": "The contribution tier was not found."
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderAddress",
            "type": "pubkey"
          },
          {
            "name": "contributionTierId",
            "type": "u64"
          },
          {
            "name": "reimbursed",
            "type": "bool"
          }
        ]
      }
    },
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
            "name": "contributions",
            "type": {
              "vec": {
                "defined": {
                  "name": "contribution"
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
            "name": "muzikieAddress",
            "type": "pubkey"
          },
          {
            "name": "walletAddress",
            "type": "pubkey"
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
            "name": "final"
          },
          {
            "name": "reimbursing"
          }
        ]
      }
    }
  ]
};
