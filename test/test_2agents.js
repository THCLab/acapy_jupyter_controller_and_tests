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
        let list = [a[0] + URL.pdsSettings, a[1] + URL.pdsSettings]
        let creds = [data.pds_set_settings_oyd, data.pds_set_settings_oyd2]
        for (let i in list) {
            await Util.post(list[i], creds[i])
            await Util.post(a[i] + URL.pdsActivate, data.pds_activate_own_your_data_data_vault)
        }

        connections = await Util.ConnectAgents(a)
    }).timeout(20000)
    it("Dids", async () => {
        for (i in a) {
            let did = await Util.CreateAndRegisterDID(a[i])
            await Util.post(a[i] + URL.setPublicDID + "?did=" + did, null, 200, false)
        }
    }).timeout(20000)

})

let added_service_id = undefined
let appliance_id = undefined
describe("Service flow", () => {
    let consent_dri = ""
    it("POST Consent", async function () {
        const res = await Util.post(a[0] + URL.consents, data.consent)
        consent_dri = res.data['dri']
    })

    it('POST Add Service', async () => {
        const res = await Util.post(a[0] + URL.servicesAdd, {
            "consent_dri": consent_dri,
            "service_schema_dri": "3trgwgwfsv" + Util.randomNumber(),
            "label": "string"
        }, 201)
        added_service_id = res['data']['service_id']
    })

    it('Request services', async () => {
        let conn_id = connections[1]['connection_id']
        let res = await axios.get(a[1] + URL.requestServices(conn_id))
    })


    it("POST Apply", async function () {
        let event = await hooks[1].webhookSeek(URL.hookRequestServices, 5000)
        let res = await Util.post(a[1] + URL.apply, {
            "user_data": { "dataasdasd": "texasdasdt" + Util.randomNumber() },
            "connection_id": connections[1]['connection_id'],
            "service_id": added_service_id
        })
        appliance_id = res['data']['appliance_id']
    }).timeout(7000)

    it("Accept application", async function () {
        // let event = await hooks[0].webhookSeek(URL.hookApplication, 1000)
        // console.log("Webhook Incoming application", event)
        let apps = await Util.get(a[0] + URL.applicationsOther)
        await Util.put(a[0] + URL.acceptApplication(apps.data[0].appliance_id))
    }).timeout(7000)
})

after(async () => {
    for (let i = 0; i < hooks.length; i++) hooks[i].terminate()
})

before(async () => {
    hooks.push(new Util.WebhookCacher(5000))
    hooks.push(new Util.WebhookCacher(5001))
})