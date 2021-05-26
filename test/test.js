let script_path = "/home/sev/Work/agent-api-spec/swagger-spec.yaml"
const URL = require("./utils").URL
const Util = require("./utils").Util
const a = URL.agents


const chai = require('chai')
const assert = chai.assert
const chaiResponseValidator = require('chai-openapi-response-validator')
const data = require('./data')
chai.use(chaiResponseValidator(script_path))

let settings = a[0] + URL.pdsSettings
describe(settings, () => {
    it('POST Add Local', async () => {
        await Util.post(settings, data.pds_set_settings_local)
    })
    it('POST Add OwnYourData', async () => {
        await Util.post(settings, data.pds_set_settings_oyd)
    })
    it('POST Add Invalid', async () => {
        await Util.postInvalid(settings, data.pds_set_settings_invalid, 408)
    })
    it('GET', async () => {
        await Util.get(settings)
    })
})

let activate = a[0] + URL.pdsActivate
describe(activate, () => {
    it('POST Activate Local', async () => {
        await Util.post(activate, data.pds_activate_local)
    })
    it('POST Activate OwnYourData', async () => {
        await Util.post(activate, data.pds_activate_own_your_data_data_vault)
    })
    it('POST Activate THCF', async () => {
        await Util.postInvalid(activate, data.pds_activate_thcf, 404)
    })
    it('POST Activate Invalid', async () => {
        await Util.postInvalid(activate, data.pds_activate_invalid, 422, false)
    })
})
let get_drivers = a[0] + URL.pdsDrivers
describe(get_drivers, () => {
    it('GET Registered Drivers', async () => {
        await Util.get(get_drivers)
    })
})
let active = a[0] + URL.pdsActive
describe(active, () => {
    it('GET Active', async () => {
        await Util.get(active)
    })
})

let chunks = a[0] + URL.pdsChunks
describe(chunks, () => {
    it('POST OcaSchemaChunks', async () => {
        await Util.post(chunks, data.oca_schema_chunks)
    })
    let chunkQuery = chunks + data.oca_schema_chunks_query
    it('GET OcaSchemaChunks', async () => {
        let res = await Util.get(chunkQuery)
    })
})

const save_url = a[0] + URL.pdsSave
describe(save_url, () => {
    it('POST GET Save', async () => {
        const payload = { "payload": "abc" }
        const res = await Util.post(save_url, payload, 200, false)
        load_id = res.data['payload_id']
        await Util.get(a[0] + `/pds/${load_id}`, 200, false)
    })
})

const consentURL = a[0] + URL.consents
describe(consentURL, () => {
    it('POST Consent', async () => {
        const res = await Util.post(consentURL, data.consent)
    })
    it('GET Consent', async () => {
        const res = await Util.get(consentURL)
    })
})

const servicesConsentURL = a[0] + URL.consents
const servicesURL = a[0] + URL.services
const servicesAddURL = a[0] + URL.servicesAdd
let added_service_id = undefined
describe(servicesConsentURL, () => {
    let consentDRI = ""
    it("POST Consent for use in AddService", async function () {
        const res = await Util.post(servicesConsentURL, data.consent)
        consentDRI = res.data['dri']
    })

    it('POST Add Service', async () => {
        console.log(consentDRI)
        const res = await Util.post(servicesAddURL, {
            "consent_dri": consentDRI,
            "service_schema_dri": "3trgwgwfsv" + Util.randomNumber(),
            "label": "string"
        }, 201)
        added_service_id = res.data['service_id']
    })

    it('GET Single service by id', async () => {
        assert(added_service_id)
        await Util.get(servicesURL + '/' + added_service_id)
    })
    it('GET All services', async () => {
        assert(added_service_id)
        await Util.get(servicesURL)
    })
})

