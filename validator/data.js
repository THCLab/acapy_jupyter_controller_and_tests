const pds_set_settings_oyd = {
    "instance_name": "string",
    "client_id": "8SX1-RBazhic9ftG4HyG2XegrQ2kdLGu0hd-Ty3IZnE",
    "client_secret": "gEg9_tTh2V1ZK6piL9tZ38YO-1xqXLDXCccJS4uQUJg",
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
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string",
            }
        ],
    },
    {
        "dri": "1252t1g2eg",
        "payload": [
            {
                "additionalProp1": "string",
                "additionalProp2": "string",
                "additionalProp3": "string",
            }
        ],
    },
]
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
}