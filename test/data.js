const random = () => String(Math.floor(Math.random() * Math.floor(10000)))
const schema_chunk_dri1 = "vgwdgfwg93t2"
const schema_chunk_dri2 = "1252t1g2eg"
module.exports = {
    oca_schema_chunks: [
        {
            "dri": schema_chunk_dri1,
            "payload": [
                {
                    "additionalProp1": "string" + random(),
                    "additionalProp2": "string" + random(),
                    "additionalProp3": "string" + random(),
                }
            ],
        },
        {
            "dri": schema_chunk_dri2,
            "payload": [
                {
                    "additionalProp1": "string",
                    "additionalProp2": "string" + random(),
                    "additionalProp3": "string",
                }
            ],
        },
    ],
    oca_schema_chunks_query: `?oca_schema_dri=${schema_chunk_dri1}&oca_schema_dri=${schema_chunk_dri2}`,
    consent: {
        "oca_schema_dri": "test_consent_dri",
        "label": "TestConsentLabel",
        "oca_data": {
            "additionalProp1": "stringa" + random(),
            "additionalProp2": "string" + random(),
            "additionalProp3": "string" + random()
        }
    },
    pds_set_settings_oyd: {
        "instance_name": "string",
        "client_id": "gVQJTSabNK8DxNzu3PeGWQwBtXSb2Iv7FgYlbzBEbfg",
        "client_secret": "9yBmtiyO2YwhtHA9btSrYensVZZ9DLNY1Vq5D-EjxwQ",
        "driver": {
            "own_your_data_data_vault": {
                "grant_type": "client_credentials",
                "api_url": "https://data-vault.eu"
            },
            "name": "own_your_data_data_vault"
        },
    },
    pds_set_settings_oyd2: {
        "instance_name": "string",
        "client_id": "nM8p2yYuxqGWvbJ50t8ODifjyFZfi-yOm2HoE6AZaW0",
        "client_secret": "X6WBjmMylTQ3BdbBRKkBir3uVz79RgADetw5tl7Tgyo",
        "driver": {
            "own_your_data_data_vault": {
                "grant_type": "client_credentials",
                "api_url": "https://data-vault.eu"
            },
            "name": "own_your_data_data_vault"
        },
    },
    pds_set_settings_local: {
        "instance_name": "string",
        "client_id": "string",
        "client_secret": "string",
        "driver": {
            "name": "local",
            "local": {
                "test": "string"
            }
        },
    },
    pds_set_settings_invalid: {
        "instance_name": "invalid",
        "client_id": "1234",
        "client_secret": "1245",
        "driver": {
            "own_your_data_data_vault": {
                "grant_type": "client_credentials",
                "api_url": "https://data-vault.eu"
            },
            "name": "own_your_data_data_vault"
        }
    },
    pds_activate_local: {
        "instance_name": "string",
        "driver": "local"
    },
    pds_activate_own_your_data_data_vault: {
        "instance_name": "string",
        "driver": "own_your_data_data_vault"
    },
    pds_activate_invalid: {
        "instance_name": "string",
        "driver": "invalid_"
    },
    pds_activate_thcf: {
        "instance_name": "string",
        "driver": "thcf_data_vault"
    }
}