function RandomNumber() {
    return String(Math.floor(Math.random() * Math.floor(10000)));
}

const pds_set_settings_oyd = {
    "instance_name": "string",
    "client_id": "-s2bdkM_cv7KYDF5xg_Lj6vil1ZJaLQJ79duOW7J9g4",
    "client_secret": "s_dR8dzbVES_vvc1-nyb1O_cuzyCz2_bRd3Lr12s4ug",
    "driver": {
        "own_your_data_data_vault": {
            "grant_type": "client_credentials",
            "api_url": "https://data-vault.eu"
        },
        "name": "own_your_data_data_vault"
    },
}
const pds_set_settings_local = {
    "instance_name": "string",
    "client_id": "string",
    "client_secret": "string",
    "driver": {
        "name": "local",
        "local": {
            "test": "string"
        }
    },
}

const pds_set_settings_invalid = {
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
}

const pds_activate_local = {
    "instance_name": "string",
    "driver": "local"
}
const pds_activate_own_your_data_data_vault = {
    "instance_name": "string",
    "driver": "own_your_data_data_vault"
}
const pds_activate_invalid = {
    "instance_name": "string",
    "driver": "invalid_"
}
const pds_activate_thcf = {
    "instance_name": "string",
    "driver": "thcf_data_vault"
}
const oca_schema_chunks = [
    {
        "dri": "vgwdgfwg93t2",
        "payload": [
            {
                "additionalProp1": "string" + RandomNumber(),
                "additionalProp2": "string" + RandomNumber(),
                "additionalProp3": "string" + RandomNumber(),
            }
        ],
    },
    {
        "dri": "1252t1g2eg",
        "payload": [
            {
                "additionalProp1": "string",
                "additionalProp2": "string" + RandomNumber(),
                "additionalProp3": "string",
            }
        ],
    },
]
const consent = {
    "oca_schema_dri": "consent_dri",
    "label": "TestConsentLabel",
    "oca_data": {
        "additionalProp1": "string" + RandomNumber(),
        "additionalProp2": "string" + RandomNumber(),
        "additionalProp3": "string" + RandomNumber()
    }
}



const oca_schema_chunks_query = `?oca_schema_dri=${oca_schema_chunks[0]['dri']}&oca_schema_dri=${oca_schema_chunks[1]['dri']}`
module.exports = {
    pds_set_settings_invalid,
    pds_set_settings_local,
    pds_set_settings_oyd,
    pds_activate_local,
    pds_activate_own_your_data_data_vault,
    pds_activate_invalid,
    pds_activate_thcf,
    oca_schema_chunks,
    oca_schema_chunks_query,
    consent,
    RandomNumber,
}