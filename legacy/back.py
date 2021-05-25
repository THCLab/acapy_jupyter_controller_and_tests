

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
    time.sleep(0.1)
    cred_exchange = get(
        8151,
        f"/issue-credential/exchange/record?thread_id={issue_cred_request['thread_id']}",
    )
    cred_exchange = cred_exchange["result"]
    id = cred_exchange[0]["credential_exchange_id"]
    issue_cred = post(8151, "/issue-credential/issue?credential_exchange_id=" + id)
time_this(100, "time_rfc36_issue_credential.json", __pds_test_issue_credential)

table = get_time_table()
for i in range(100):
    table['total_time'][i] -= 0.1
    
with open("time_rfc36_issue_credential_final.json", 'w') as outfile:
    json.dump(table, outfile, sort_keys=True, indent=4)
    print("DONE!")
    
-------------------

def test_present_proof():
    request_proof = post(
        8151,
        "/present-proof/request",
        {
            "connection_id": connection[1],
            "schema_base_dri": credential['credentialSubject']['oca_schema_dri'],
            "requested_attributes": ["address"],
            "issuer_did": "123145",
        },
    )
    exchange_id_agent2 = request_proof["exchange_id"]
    exchange_record = {"result": []}
    while exchange_record.get("result") == []:
        exchange_record = get(
            8150,
            f"/present-proof/exchange/record?state=request_received",
        )

    # # FETCH CREDENTIALS (1)
    creds = get(8150, "/credentials")

    # # PRESENT PROOF (1)
    present = post(
        8150,
        "/present-proof/present",
        {
            "credential_id": creds["result"][0]["dri"],
            "exchange_record_id": exchange_record["result"][0][
                "presentation_exchange_id"
            ],
        },
    )

    exchange_record = get(
        8151,
        f"/present-proof/exchange/record?connection_id={connection[1]}&thread_id={request_proof['thread_id']}",
    )

    time.sleep(1)
    exchange_record = get(
        8151,
        f"/present-proof/exchange/record?state=presentation_received",
    )

    issue_cred = post(
        8151,
        f"/present-proof/acknowledge?status=true&exchange_record_id={exchange_record['result'][0]['presentation_exchange_id']}",
    )

time_this(100, "time_rfc37_present_proof.json", test_present_proof)

import copy
copy_table = copy.deepcopy(get_time_table())

table = get_time_table()
for i in range(100):
    table['total_time'][i] -= 1d
    
with open('time_rfc37_present_proof_final.json', 'w') as outfile:
    json.dump(table, outfile, sort_keys=True, indent=4)
