import aries_cloudagent.wallet.crypto as crypto
import requests
import base64
import base58
import json
import uuid
import regex


def connectWithAcapy(agent, controller):
    uniqueId = str(uuid.uuid4())
    # our request body
    message = {
        "@id": uniqueId,
        "~transport": {"return_route": "all"},
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request",
        "label": "Plugin",
        "connection": {
            "DID": controller["did"],
            "DIDDoc": {
                "@context": "https://w3id.org/did/v1",
                "id": controller["did"],
                "publicKey": [
                    {
                        "id": controller["did"] + "#keys-1",
                        "type": "Ed25519VerificationKey2018",
                        "controller": controller["did"],
                        "publicKeyBase58": controller["public_key_b58"],
                    }
                ],
                "service": [
                    {
                        "id": controller["did"] + ";indy",
                        "type": "IndyAgent",
                        "recipientKeys": controller["public_key_b58"],
                        "serviceEndpoint": "",
                    }
                ],
            },
        },
    }
    # encoding it with aries crypto function using the key that was
    # given to us by aca-py in recipientKeys
    decodedAcapyKey = base58.b58decode(agent["invite"]["recipientKeys"][0])
    ourPrivateKey = controller["keypair"][1]
    encodedMessage = crypto.encode_pack_message(
        json.dumps(message), [decodedAcapyKey], ourPrivateKey
    )

    encodedMessage = encodedMessage.decode("ascii")

    connectionRequestResponse = requests.post(
        agent["invite"]["serviceEndpoint"], data=encodedMessage
    )
    assert connectionRequestResponse.text != "", "invalid response from acapy"

    connectionRequestResponseUnpacked = unpackMessage(
        connectionRequestResponse.text, controller["keypair"][1]
    )

    connectionRequestResponseDict = json.loads(connectionRequestResponseUnpacked[0])
    return connectionRequestResponseDict


def decodeConnectionDetails(connection):
    sig_data_raw = connection["connection~sig"]["sig_data"]
    #  (this is a hack)replacing artifacts that sometimes happen
    sig_data_raw = sig_data_raw.replace("-", "1")
    sig_data_raw = sig_data_raw.replace("_", "1")

    sig_data_raw = base64.b64decode(sig_data_raw)
    # avoid first 8 characters as they are a time signature
    sig_data_raw = sig_data_raw[8:]
    sig_data_raw = sig_data_raw.decode("ascii")

    sig_data = json.loads(sig_data_raw)
    return sig_data


# Process invite url, delete white spaces
def processInviteUrl(url):
    result = {}
    url = url.replace(" ", "")
    # Regex(substitution) to extract only the invite string from url
    result["invite_string_b64"] = regex.sub(r".*(c\_i\=)", r"", url)
    # Decoding invite string using base64 decoder
    result["invite_string"] = base64.b64decode(result["invite_string_b64"])
    # Converting our invite json string into a dictionary
    result["invite"] = json.loads(result["invite_string"])
    return result


# a bit of a hack to simplify message unpacking,
# decode_pack_message needs a callable object for some reason
def unpackMessage(message, privateKey):
    class FindKey:
        def __init__(self, key):
            self.key = key

        def __call__(self, argument):
            return self.key

    find_key = FindKey(privateKey)
    return crypto.decode_pack_message(message, find_key)


# packs a dictionary into a encoded message
def packMessage(message: dict, connection: dict) -> bytes:
    # pass in our private key and recipient key to the encode_pack_message
    decodedRecipientKey = base58.b58decode(
        connection["DIDDoc"]["service"][0]["recipientKeys"][0]
    )
    packedMessage = crypto.encode_pack_message(
        json.dumps(message), [decodedRecipientKey], connection["myKey"]
    )
    return packedMessage.decode("ascii")


# parameters are dict items you want to pass into the message
# e.g. buildMessage(
#    "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query",
#    payload="aaa")
def buildMessage(protocol: str, **parameters) -> dict:
    message = {}
    message["@id"] = str(uuid.uuid4())
    message["@type"] = protocol
    message["~transport"] = {}
    message["~transport"]["return_route"] = "all"
    for name, value in parameters.items():
        message[name] = value
    return message


# pack a message, send message, unpack and return response as dict
def sendMessage(message: dict, connection: dict) -> dict:
    encodedMessage = packMessage(message, connection)
    endpoint = connection["DIDDoc"]["service"][0]["serviceEndpoint"]
    response = requests.post(endpoint, data=encodedMessage)
    responseDecoded = unpackMessage(response.text, connection["myKey"])
    responseDecoded = json.loads(responseDecoded[0])
    return responseDecoded


# needs testing
def createInvitation(agent, label=None, alias=None):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/0.1/create-invitation",
        label=label,
        auto_accept="auto",
        alias=alias,
    )
    return sendMessage(message, agent)


# needs testing
def receiveInvitation(agent, invitation):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-connections/0.1/receive-invitation",
        auto_accept=True,
        invitation=createInvitation["invitation_url"],
    )
    return sendMessage(message, agent)


# needs testing
def receiveInvitationURL(agent, invitationURL):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-connections/0.1/receive-invitation",
        auto_accept=True,
        invitation=createInvitation,
    )
    return sendMessage(message, agent)


# connects agent1 to agent2 where agent2 receives invitation
# returns agent2 response from receiveing invitation
def connectAgents(connectionAgent1, connectionAgent2):
    ## create invitation
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/0.1/create-invitation",
        label="ConnectionBetweenAgents",
        auto_accept="auto",
        alias="agent1ToAgent2",
    )
    createInvitation = sendMessage(message, connectionAgent1)

    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-connections/0.1/receive-invitation",
        auto_accept=True,
        invitation=createInvitation["invitation_url"],
    )
    receiveInvitation = sendMessage(message, connectionAgent2)

    return [createInvitation, receiveInvitation]


## after agents connect


def getDidsList(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/get-list-dids"
    )
    dids = sendMessage(message, agent)
    return dids


def getConnections(agent):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-connections/0.1/get-list"
    )
    return sendMessage(message, agent)


## connection, admin connection to agent, connection_id -> id of the agent to agent connection
def sendBasicMessage(agent, agent_to_agent_connection_id, content):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/send",
        connection_id=agent_to_agent_connection_id,
        content=content,
    )
    response = sendMessage(message, agent)
    return response


def getBasicMessage(agent):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/get"
    )
    public_did = sendMessage(message, agent)
    return public_did


def getFeatureDiscovery(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query", query="*"
    )
    return sendMessage(message, agent)


def deleteBasicMessage(agent, connection_id, message_id):
    message = buildMessage(
        "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
        connection_id=connection_id,
        message_id=message_id,
    )
    return sendMessage(message, agent)


# this works but is not handled well on toolbox side
def registerDidOnLedger(agent, did, verkey, alias=None, role=None):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/register-did",
        did=did,
        verkey=verkey,
    )
    return sendMessage(message, agent)


def getPublicDid(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/get-public-did"
    )
    return sendMessage(message, agent)


def setPublicDid(agent, did):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/set-public-did", did=did
    )
    return sendMessage(message, agent)


def createDid(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/0.1/create-did"
    )
    return sendMessage(message, agent)


def schemaGetList(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/0.1/schema-get-list"
    )
    return sendMessage(message, agent)


# send schema in toolbox needs better error handling when sending duplicate name
def sendSchema(agent, schema_name, schema_version, attributes):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/0.1/send-schema",
        schema_name=schema_name,
        schema_version=schema_version,
        attributes=attributes,
    )
    return sendMessage(message, agent)


def schemaGet(agent, schema_id):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-schemas/0.1/schema-get",
        schema_id=schema_id,
    )
    return sendMessage(message, agent)


def sendCredentialDefinition(agent, schema_id):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/0.1/send-credential-definition",
        schema_id=schema_id,
    )
    return sendMessage(message, agent)


# cred def needs error handling
def getCredentialDefinition(agent, cred_def_id):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/0.1/credential-definition-get",
        cred_def_id=cred_def_id,
    )
    return sendMessage(message, agent)


def getCredentialDefinitionList(agent):
    message = buildMessage(
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-credential-definitions/0.1/credential-definition-get-list"
    )
    return sendMessage(message, agent)


localhost = "http://localhost:"
agent1 = "http://localhost:8150"
agent2 = "http://localhost:8151"


def save_to_pds(some_json):
    add = requests.post(agent1 + "/pds/save", json=some_json)
    assert_status_code_is_200(add)

    add = json.loads(add.text)
    return add


def save_to_pds2(some_json):
    add = requests.post(agent2 + "/pds/save", json=some_json)
    assert_status_code_is_200(add)

    add = json.loads(add.text)
    return add


def get_from_pds(some_id):
    get = requests.get(agent1 + "/pds/" + some_id)
    assert_status_code_is_200(get)

    get = json.loads(get.text)
    return get


def get_from_pds2(some_id):
    get = requests.get(agent1 + "/pds/" + some_id)
    assert_status_code_is_200(get)

    get = json.loads(get.text)
    return get


def save_and_retrieve(optional_test_string=""):
    payload = {"payload": "testing" + " " + optional_test_string}
    id = save_to_pds(payload)
    content = get_from_pds(str(id["payload_id"]))

    content.pop("success", None)
    assert (
        payload == content
    ), f"initial payload not equal to return value from pds {payload, content}"

    return id["payload_id"]


def get_pdses():
    get1 = requests.get(agent1 + "/pds")
    get2 = requests.get(agent2 + "/pds")

    assert get1.text != None and get2.text != None
    assert_status_code_is_200(get1)
    assert_status_code_is_200(get2)

    return [get1.text, get2.text]


def set_pds_config(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent1 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)

    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent2 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        assert_status_code_is_200(config)

    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_pds_config_agent1(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent1 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_pds_config_agent2(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent2 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_own_your_data():
    set_pds_config(
        "own_your_data",
        {
            "client_id": "GSM0HAaGVHrrcaUiiAufGWcuvpHOYG3mvwloWUcASzs",
            "client_secret": "cs1iLd7QUMtjFNYn0hToWXiBv0nquSJ-s5BUPyFRRDI",
            "api_url": "https://data-vault.eu",
        },
    )


def activate_pds_both_agents(pds_type, instance_name="default"):
    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)
    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def test_pds_return_same_id():
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


def assert_status_code_is_200(response_object):
    get = response_object
    if get.status_code != 200:
        print("status_code: " + str(get.status_code) + "  value: " + str(get.text))
        assert get.status_code == 200, "status_code is not 200"


def get(port, url_end) -> dict:
    port = str(port)
    request = requests.get(localhost + port + url_end)
    assert_status_code_is_200(request)
    result = json.loads(request.text)
    return result


def post(port, url_end, json_dict=None) -> dict:
    port = str(port)
    if json_dict != None:
        request = requests.post(localhost + port + url_end, json=json_dict)
    else:
        request = requests.post(localhost + port + url_end)

    assert_status_code_is_200(request)
    result = json.loads(request.text)
    return result
