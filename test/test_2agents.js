const hooks = []
const URL = require("./utils").URL
const Util = require("./utils").Util
const a = URL.agents

const chai = require('chai')
const expect = chai.expect
const axios = require('axios')
const data = require('./data')

let connections = []
describe("Setup", () => {
    it("Setup", async () => {
        let list = [a[0] + URL.pds_settings, a[1] + URL.pds_settings]
        for (let i in list)
            await Util.post(list[i], data.pds_set_settings_oyd)

        connections = await Util.ConnectAgents(a)
    }).timeout(20000)
    it("Dids", async () => {
        for (i in a) {
            let did = await Util.CreateAndRegisterDID(a[i])
            await Util.post(a[i] + URL.set_public_did + "?did=" + did, null, 200, false)
        }
    }).timeout(20000)

})

let added_service_uuid = undefined
let appliance_uuid = undefined
describe("Service flow", () => {
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
    })


    it("POST Apply", async function () {
        let event = await hooks[1].webhookSeek(URL.hookRequestServices, 5000)
        console.log("Request services list: ", event)

        let res = await Util.post(a[1] + URL.apply, {
            "user_data": { "dataasdasd": "texasdasdt" + Util.randomNumber() },
            "connection_uuid": connections[1]['connection_id'],
            "service_uuid": added_service_uuid
        })
        appliance_uuid = res['data']['appliance_uuid']
    }).timeout(7000)

    it("Accept application", async function () {
        let event = await hooks[0].webhookSeek(URL.hookApplication, 1000)
        console.log("Webhook Incoming application", event)
        apps = await Util.get(a[0], + URL.applicationsOther)
        print("API Incoming Applications: ", apps)
        // await Util.put(a[0] + URL.acceptApplication(appliance_uuid), {
        //     "user_data": { "data": "text" },
        //     "connection_uuid": connections[1]['connection_id'],
        //     "service_uuid": added_service_uuid
        // })
    }).timeout(7000)
})

after(async () => {
    for (let i = 0; i < hooks.length; i++) hooks[i].terminate()
})

before(async () => {
    hooks.push(new Util.WebhookCacher(5000))
    hooks.push(new Util.WebhookCacher(5001))
})