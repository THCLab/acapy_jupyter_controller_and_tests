import requests
import json
import aries_cloudagent.wallet.crypto as crypto
import base64
import base58
import uuid
import hashlib
import time
from .jupyter_util import *


def assert_success(d):
    if isinstance(d, dict) is False:
        print("not dict", type(d))
    if d.get("success") is not True:
        print(d)


def test_pds_set_config_save_read():
    set_pds_config("local")
    save_and_retrieve("local")
    set_pds_config("data_vault", {"api_url": "http://ocadatavault"})
    save_and_retrieve("data_vault_thcf")
    set_pds_config("data_vault", {"api_url": "http://ocadatavault"}, "vault2")
    save_and_retrieve("data_vault_thcf_2")


def __test_pds_set_config_save_read_oyd():
    set_own_your_data()
    payload_id = save_and_retrieve("own_your_data")
    ## TEST that Settings are persistent!
    activate_pds_both_agents("data_vault")
    save_and_retrieve("data_vault_thcf")
    activate_pds_both_agents("data_vault", "vault2")
    save_and_retrieve("data_vault_thcf_2")
    activate_pds_both_agents("own_your_data")
    payload_id = save_and_retrieve("own_your_data")


def __test_pds_return_same_id():
    set_own_your_data()
    id1 = save_to_pds({"payload": "testing"})
    set_pds_config("local")
    id2 = save_to_pds({"payload": "testing"})

    assert (
        id1["payload_id"] == id2["payload_id"]
    ), "own_your_data and local return different ids"

    set_pds_config("local")
    id1 = save_to_pds({"payload": "testing"})
    set_pds_config("thcf_data_vault", {"host": "http://ocadatavault"})
    id2 = save_to_pds({"payload": "testing"})

    assert (
        id1["payload_id"] == id2["payload_id"]
    ), "local and thcf_data_vault return different ids"

    return [id1, id2]


# needs a agent to agent connection
def __pds_test_issue_credential():
    issue_cred_request = post(
        8150,
        "/issue-credential/request",
        {
            "credential_values": {
                "type": "Person",
                "address": {
                    "type": "PostalAddress",
                    "streetAddress": "123 Main St.",
                    "addressLocality": "Blacksburg",
                    "addressRegion": "VA",
                    "postalCode": "24060",
                    "addressCountry": "US",
                },
            },
            "connection_id": connection[0],
        },
    )
    cred_exchange = get(
        8151,
        f"/issue-credential/exchange/record?connection_id={connection[1]}&thread_id={issue_cred_request['thread_id']}",
    )
    cred_exchange = cred_exchange["result"]
    id = cred_exchange[0]["credential_exchange_id"]
    issue_cred = post(8151, "/issue-credential/issue?credential_exchange_id=" + id)


import random


def test_services():
    add_consent = post(
        8151,
        "/verifiable-services/consents",
        {
            "label": "test_" + str(random.randint(1, 100000000)),
            "oca_schema_namespace": "consent",
            "oca_schema_dri": "fArVHJTQSKHu2CeXJocQmH3HHxzZXsuQD7kzyHJhQ49s",
            "oca_data": {
                "expiration": "7200",
                "limitation": "7200",
                "dictatedBy": "test",
                "validityTTL": "7200",
            },
        },
    )
    get_consents_provider = get(8151, "/verifiable-services/consents")
    get_consents_user = get(8150, "/verifiable-services/consents")

    save_data_to_pds = post(
        8151,
        "/pds/save",
        {
            "payload": json.dumps(
                {
                    "associatedReportID": "Text12",
                    "uniqueNumericIDHash": "Text",
                    "disease": "Text",
                    "vaccineDescription": "Text",
                    "atcCode": "Text",
                    "certificateIssuer": "Text",
                    "certificateNumber": "Text",
                    "certificateValidFrom": "Date",
                    "certificateValidTo": "Date",
                    "formVersion": "Text",
                }
            ),
            "oca_schema_dri": "dip.data.tda.oca_chunks.predefined.9GdWoQwth9299oYj8HfdgRZjtSxW9sTVyy1RnfhQ35yA",
        },
    )
    add = post(
        8151,
        "/verifiable-services/add",
        {
            "label": "consent_test",
            "service_schema": {
                "oca_schema_namespace": "string",
                "oca_schema_dri": "12345",
            },
            "certificate_schema": {
                "oca_schema_namespace": "string",
                "oca_schema_dri": "9GdWoQwth9299oYj8HfdgRZjtSxW9sTVyy1RnfhQ35yA",
            },
            "consent_id": add_consent["consent_id"],
        },
    )
    service_list = get(8150, "/verifiable-services/DEBUGrequest/" + connection[0])
    service = service_list["result"]["services"][-1]
    service.pop("policy_validation", None)
    apply = post(
        8150,
        "/verifiable-services/apply",
        {
            "connection_id": connection[0],
            "user_data": '{"memes": "films"}',
            "service": service,
        },
    )
    time.sleep(1)
    issue_self = post(
        8151,
        "/verifiable-services/get-issue",
        {
            "exchange_id": apply["exchange_id"],
        },
    )
    issue_self = issue_self["result"]
    process_application = post(
        8151,
        "/verifiable-services/process-application",
        {
            "issue_id": issue_self[0]["issue_id"],
            "decision": "accept",
            "data": {"test": "certificate"},
        },
    )


# time_this(75, "time_services_new.json", test_services)