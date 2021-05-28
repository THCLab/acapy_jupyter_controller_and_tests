const Util = require('./utils').Util
const URL = require('./utils').URL
const a = ["http://localhost:8150", "http://localhost:8151"]
const data = require('./data')
const axios = require('axios')
const chai = require('chai')
const assert = chai.assert
let hooks = []
let conn = []

async function Setup() {
    let conn = await Util.ConnectAgents(a)
    let dids = await Util.SetupDIDs(a)
    let sett = [
        {
            "client_id": "8SX1-RBazhic9ftG4HyG2XegrQ2kdLGu0hd-Ty3IZnE",
            "client_secret": "gEg9_tTh2V1ZK6piL9tZ38YO-1xqXLDXCccJS4uQUJg",
            "api_url": "https://data-vault.eu",
        },
        {
            "scope": "admin",
            "client_id": "50c67447e28eeb5ac56bd8bc3fbfbc5916f817603eb3f117f01e84d52e36afb7",
            "client_secret": "6f20318f0a451b24a9c4aaa00214626d6e0f6b15d18957acd11a085c4d7b2dbd",
            "api_url": "https://dip-officer.data-container.net"
        },

    ]
    for (let i = 0; i < 2; i++) {
        const res = await post(a[i], URL.pdsSettings, {
            "settings": {
                "own_your_data": sett[i]
            }
        })
        const res2 = await post(a[i], "/pds/activate?type=own_your_data")
    }

    return conn
}

before(() => {
    hooks.push(new Util.WebhookCacher(5000))
    hooks.push(new Util.WebhookCacher(5001))
    conn = Setup()
})

after(() => {
    for (let i = 0; i < hooks.length; i++) hooks[i].terminate()
})

async function post(agent, path, json) {
    let result
    try {
        result = await axios.post(agent + path, json)
    } catch (error) { Util.invalidCodepath(error); result = error['response'] }
    return result['data']
}



describe("", () => {
    let consent = undefined
    it("Consent define", async () => {
        consent = await axios.post(a[1] + "/verifiable-services/consents", {
            "label": "test_" + String(Math.random()),
            "oca_schema_namespace": "consent",
            "oca_schema_dri": "fArVHJTQSKHu2CeXJocQmH3HHxzZXsuQD7kzyHJhQ49s",
            "oca_data": {
                "expiration": "7200",
                "limitation": "7200",
                "dictatedBy": "test",
                "validityTTL": "7200",
            }
        })
    })
    it("Send cert", async () => {
        const res = await axios.post(a[1] + "/pds/save", {
            "payload": JSON.stringify({
                "associatedReportID": "Text",
                "uniqueNumericIDHash": "Text",
                "disease": "Text",
                "vaccineDescription": "Text",
                "atcCode": "Text",
                "certificateIssuer": "Text",
                "certificateNumber": "Text",
                "certificateValidFrom": "Date",
                "certificateValidTo": "Date",
                "formVersion": "Text",
            }), "oca_schema_dri": "dip.data.tda.oca_chunks.predefined.9GdWoQwth9299oYj8HfdgRZjtSxW9sTVyy1RnfhQ35yJa"
        })
    })
    let addService = undefined
    it("Add service", async () => {
        addService = await axios.post(a[1] + '/verifiable-services/add', {
            "label": "consent_test",
            "service_schema": {
                "oca_schema_namespace": "string",
                "oca_schema_dri": "12345"
            },
            "certificate_schema": {
                "oca_schema_namespace": "string",
                "oca_schema_dri": "9GdWoQwth9299oYj8HfdgRZjtSxW9sTVyy1RnfhQ35yJa"
            },
            "consent_id": consent['data']['consent_id']
        })
    })
    let serv = undefined
    it("Request service and seek service", async () => {
        function seekService(list, id) {
            let serv = undefined
            for (let i = 0; i < list.length; i++) {
                if (list[i]['service_id'] == id) {
                    serv = list[i]
                }
            }
            if (serv == undefined) throw Error("service not found")
            return serv
        }
        try {
            let url = a[0] + '/verifiable-services/DEBUGrequest/' + conn[0]['connection_id']
            console.log(url)
            let serviceList = await axios.get(url)
            assert(addService != undefined, "addService is undefined")
            serv = seekService(serviceList['data']['result']['services'], addService['data']['service_id'])
            assert(serv != undefined, "service is undefined")
        } catch (error) { Util.invalidCodepath(error) }

        assert(serv != undefined, "service is undefined")
        let apply = await post(a[0], "/verifiable-services/apply", {
            "connection_id": conn[0]['connection_id'],
            "user_data": JSON.stringify({ "data": "test" }),
            "service": serv,
        })
        let issue = await axios.post(a[1] + "/verifiable-services/get-issue", {
            "exchange_id": apply['exchange_id']
        })
        console.log(issue)
        let issue_id = issue['result'][0]['issue_id']

        let application = await axios.post(a[1] + "/verifiable-services/process-application", {
            "issue_id": issue_id,
            "decision": "accept"
        })
        // console.log(application)

        console.log("QUEUE", await hooks[1].event_queue)
    }).timeout(10000)


})

