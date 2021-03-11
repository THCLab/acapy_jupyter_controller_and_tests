let script_path = "/home/sevni/Documents/thclab/aries/agent-api-spec/swagger-spec.yaml"
const agent = ["http://localhost:8150", "http://localhost:8151"]
const create_admin_inv = "/connections/create-admin-invitation-url"
const create_inv = "/connections/create-invitation?alias=agent_connection&auto_accept=true&multi_use=true"
const receive_inv = "/connections/receive-invitation?auto_accept=true"
const create_did = "/wallet/did/create"
const set_public_did = "/wallet/did/public"
const LEDGER_URL = "http://localhost:9000"
const GENESIS_URL = LEDGER_URL + "/genesis"

const chai = require('chai')
const expect = chai.expect
const chaiResponseValidator = require('chai-openapi-response-validator')
const axios = require('axios')
const data = require('./data')
const InvalidCodepath = data.InvalidCodepath
const { assert } = require('chai')

chai.use(chaiResponseValidator(script_path))

function ProcessInviteURL(URL) {
    // Grab the query parameters
    index = URL.indexOf("?c_i=") + 5
    let substring = URL.substring(index)

    let content = new Buffer(substring, "base64").toString("ascii")
    content = JSON.parse(content)
    return content
}



let connections = []
describe("Connecting 2 agents", () => {
    let admin_data = ["", ""]
    it('Create admin URL', async () => {
        for (i in [0, 1]) {
            try {
                admin_data[i] = await axios.post(agent[i] + create_admin_inv)
                admin_data[i] = admin_data[i].data['invitation_url']
                admin_data[i] = ProcessInviteURL(admin_data[i])
            }
            catch (error) {
                InvalidCodepath(error, "Agent" + String(i))
            }
        }
    })

    let invi = [undefined, undefined] // invitations
    it('Connect agents', async () => {

        for (i in [0, 1]) {
            try {
                let res = await axios.post(agent[i] + create_inv)
                invi[i] = res.data
            }
            catch (error) {
                InvalidCodepath(error, "Agent" + String(i))
            }
        }

        let j = 1
        for (i in [0, 1]) {
            try {
                let res = await axios.post(agent[i] + receive_inv, {
                    "label": "Bob",
                    "recipientKeys": invi[j]['invitation']['recipientKeys'],
                    "serviceEndpoint": invi[j]['invitation']['serviceEndpoint'],
                })
                connections.push(res.data)
            } catch (error) {
                InvalidCodepath(error, "Agent" + String(i))
            }
            j--
        }

    })
})

async function CreateAndRegisterDID(agent) {
    let did
    let verkey
    let alias = agent

    let res = await axios.post(agent + create_did)
    did = res.data['result']['did']
    verkey = res.data['result']['verkey']
    assert(did)
    assert(verkey)

    res = await axios.post(LEDGER_URL + "/register", {
        "did": did, "verkey": verkey, "alias": alias, "role": "ENDORSER"
    })

    return did
}

let did = []
describe("Registering DIDs on ledger", () => {
    it('Create and register DID on ledger', async () => {
        for (i in [0, 1]) {
            did.push(await CreateAndRegisterDID(agent[i]))
        }
    }).timeout(10000)
    it('Set active DID', async () => {
        for (i in [0, 1]) {
            let res = await axios.post(agent[i] + set_public_did + "?did=" + did[i])
        }
    }).timeout(10000)
})

const services_consent_url = agent[0] + '/consents'
const services_url = agent[0] + '/services'
const services_add_url = services_url + '/add'
let added_service_uuid = undefined
describe(services_consent_url, () => {
    let consent_dri = ""
    it("POST Consent for use in AddService", async function () {
        const res = await axios.post(services_consent_url, data.consent)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
        consent_dri = res.data['dri']
    })

    it('POST Add Service', async () => {
        try {
            const res = await axios.post(services_add_url, {
                "consent_dri": consent_dri,
                "service_schema_dri": "3trgwgwfsv" + data.RandomNumber(),
                "label": "string"
            })
            added_service_uuid = res.data['service_uuid']
            assert(added_service_uuid)
            expect(res.status).to.equal(201)
            expect(res).to.satisfyApiSpec
        } catch (error) {
            InvalidCodepath(error)
        }
    })
})


describe("Test services", () => {
    it('Request services', async () => {
        let conn_id = connections[1]['connection_id']
        let res = await axios.get(agent[1] + `/connections/${conn_id}/services`)
    })
})


// async function Connect2Agents() {
//     let connections = []
//     for (i in [0, 1]) {
//         try {
//             admin_data[i] = await axios.post(agent[i] + create_admin_inv)
//             admin_data[i] = admin_data[i].data['invitation_url']
//             admin_data[i] = ProcessInviteURL(admin_data[i])
//         }
//         catch (error) {
//             InvalidCodepath(error, "Agent" + String(i))
//         }
//     }

//     let invi = [undefined, undefined] // invitations

//     for (i in [0, 1]) {
//         try {
//             let res = await axios.post(agent[i] + create_inv)
//             invi[i] = res.data
//         }
//         catch (error) {
//             InvalidCodepath(error, "Agent" + String(i))
//         }
//     }

//     let j = 1
//     for (i in [0, 1]) {
//         try {
//             let res = await axios.post(agent[i] + receive_inv, {
//                 "label": "Bob",
//                 "recipientKeys": invi[j]['invitation']['recipientKeys'],
//                 "serviceEndpoint": invi[j]['invitation']['serviceEndpoint'],
//             })
//             connections.push(res.data)
//         } catch (error) {
//             InvalidCodepath(error, "Agent" + String(i))
//         }
//         j--
//     }

//     return connections
// }