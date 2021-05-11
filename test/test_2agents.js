
const hooks = []
const URL = require("./utils").URL
const Util = require("./utils").Util
const a = URL.agents

const chai = require('chai')
const expect = chai.expect
const axios = require('axios')
const data = require('./data')
const InvalidCodepath = data.InvalidCodepath
const { assert } = require('chai')

let connections = []
describe("Setup", () => {
    it("Setup", async () => {
        let list = [a[0] + URL.pds_settings, a[1] + URL.pds_settings]
        for (let i in list)
            await Util.post(list[i], data.pds_set_settings_oyd)

        connections = await Util.ConnectAgents(a)
    })
    it("Dids", async () => {
        for (i in a) {
            let did = await Util.CreateAndRegisterDID(a[i])
            await Util.post(a[i] + URL.set_public_did + "?did=" + did, null, 200, false)
        }
    }).timeout(20000)

})

let added_service_uuid = undefined
describe("Add service, define consent", () => {
    let consent_dri = ""
    console.log(a[0] + URL.consents)
    it("POST Consent", async function () {
        const res = await Util.post(a[0] + URL.consents, data.consent)
        consent_dri = res.data['dri']
    })

    it('POST Add Service', async () => {
        const res = await Util.post(a[0] + URL.services_add, {
            "consent_dri": consent_dri,
            "service_schema_dri": "3trgwgwfsv" + Util.randomNumber(),
            "label": "string"
        }, 201)
        added_service_uuid = res['data']['service_uuid']
    })

    it('Request services', async () => {
        let conn_id = connections[1]['connection_id']
        let res = await axios.get(a[1] + URL.requestServices(conn_id))
        let event = await hooks[1].webhookSeek("/services/request-service-list/")
        console.log("event: ", event)
        res = await Util.post(a[1] + URL.apply, {
            "user_data": { "data": "text" },
            "connection_uuid": connections[1]['connection_id'],
            "service_uuid": added_service_uuid
        })
    })
})

// describe("Accept application", () => {
//     it(apply_url, async function () {
//         let event = await hooks[0].webhookSeek("/services/application")
//         // console.log(event)
//         // const apply_url = a[0] + `/applications/${appliance_uuid}/accept`
//         // try {
//         //     let res = await Util.post(apply_url, {
//         //         "user_data": { "data": "text" },
//         //         "connection_uuid": connections[1]['connection_id'],
//         //         "service_uuid": added_service_uuid
//         //     })
//         //     expect(res.status).to.equal(200)
//         //     expect(res).to.satisfyApiSpec
//         // }
//         // catch (error) {
//         //     InvalidCodepath(error)
//         // }
//     })
// })

after(async () => {
    for (let i = 0; i < hooks.length; i++) hooks[i].terminate()
})

before(async () => {
    hooks.push(new Util.WebhookCacher(5001))
    hooks.push(new Util.WebhookCacher(5000))
})