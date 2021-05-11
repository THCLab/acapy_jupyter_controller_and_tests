let script_path = "/home/sev/Work/agent-api-spec/swagger-spec.yaml"
const a1 = "http://localhost:8150"
const a2 = "http://localhost:8151"

const chai = require('chai')
const expect = chai.expect
const chaiResponseValidator = require('chai-openapi-response-validator')
const axios = require('axios')
const data = require('./data')
const InvalidCodepath = data.InvalidCodepath
const { assert } = require('chai')
chai.use(chaiResponseValidator(script_path))

let setting_url = a1 + '/pds/settings'
describe(setting_url, () => {
    it('POST Add Local', async () => {
        try {
            const res = await axios.post(setting_url, data.pds_set_settings_local)
            expect(res.status).to.equal(200)
            expect(res).to.satisfyApiSpec
        }
        catch (error) { InvalidCodepath(error) }
    })
    it('POST Add OwnYourData', async () => {
        try {
            const res = await axios.post(setting_url, data.pds_set_settings_oyd)
            expect(res.status).to.equal(200)
            expect(res).to.satisfyApiSpec
        }
        catch (error) { InvalidCodepath(error) }
    })
    it('POST Add Invalid', async () => {
        try {
            const res = await axios.post(setting_url, data.pds_set_settings_invalid)
            InvalidCodepath(res)
        }
        catch (err) {
            expect(err.response.status).to.equal(408)
            expect(err.response).to.satisfyApiSpec
        }
    })
    it('GET', async () => {
        try {
            const res = await axios.get(setting_url)
            expect(res.status).to.equal(200)
            expect(res).to.satisfyApiSpec
        }
        catch (err) { InvalidCodepath(err) }
    })
})
let activate_url = a1 + '/pds/activate'
describe(activate_url, () => {
    it('POST Activate Local', async () => {
        const res = await axios.post(activate_url, data.pds_activate_local)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
    })
    it('POST Activate OwnYourData', async () => {
        const res = await axios.post(activate_url, data.pds_activate_own_your_data_data_vault)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
    })
    it('POST Activate THCF', async () => {
        try {
            const res = await axios.post(activate_url, data.pds_activate_thcf)
            InvalidCodepath(res)
        }
        catch (res) {
            expect(res.response.status).to.equal(404)
            expect(res.response).to.satisfyApiSpec
        }
    })
    it('POST Activate Invalid', async () => {
        axios.post(activate_url, data.pds_activate_invalid)
            .then(function (res) {
                expect.fail("Invalid response")
            })
            .catch(function (res) {
                expect(res.status).to.equal(422)
            })
    })
})
let get_drivers = a1 + '/pds/drivers'
describe(get_drivers, () => {
    it('GET Registered Drivers', async () => {
        const res = await axios.get(get_drivers)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
    })
})
let active_url = a1 + '/pds/active'
describe(active_url, () => {
    it('GET Active', async () => {
        const res = await axios.get(active_url)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
    })
})
// let post_chunks = a1 + '/pds/oca-schema-chunks/'
// describe(post_chunks, () => {
//     it('POST OcaSchemaChunks', async () => {
//         let res
//         try {
//             res = let data = 
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
//     let get_chunks = post_chunks + data.oca_schema_chunks_query
//     console.log(get_chunks)
//     it('GET OcaSchemaChunks', async () => {
//         let res
//         try {
//             res = await axios.get(get_chunks)
//         }
//         catch (err) { throw Error("Invalid response") }

//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
// })

const save_url = a1 + '/pds/save'
describe(save_url, () => {
    it('POST GET Save', async () => {
        try {
            const payload = { "payload": "abc" }
            const res = await axios.post(save_url, payload)
            load_id = res.data['payload_id']
            expect(res.status).to.equal(200)

            let load_url = a1 + `/pds/${load_id}`
            const res2 = await axios.get(load_url)
            expect(res2.status).to.equal(200)
            expect(res2.data['payload']).to.eq(payload['payload'])
        }
        catch (error) { InvalidCodepath(error) }
    })
})

const consent_url = a1 + '/consents'
describe(consent_url, () => {
    it('POST Consent', async () => {
        const res = await axios.post(consent_url, data.consent)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
    })
    it('GET Consent', async () => {
        const res = await axios.get(consent_url)
        expect(res.status).to.equal(200)
        expect(res).to.satisfyApiSpec
        // console.log(res)
    })
})

const services_consent_url = a1 + '/consents'
const services_url = a1 + '/services'
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

describe(services_consent_url, () => {
    it('GET Single service by id', async () => {
        assert(added_service_uuid)
        let service_get = services_url + '/' + added_service_uuid
        try {
            const res = await axios.get(service_get)
            expect(res.status).to.equal(200)
            expect(res).to.satisfyApiSpec
        } catch (error) {
            InvalidCodepath(error)
        }
    })
    it('GET All services', async () => {
        assert(added_service_uuid)
        let service_get = services_url
        try {
            const res = await axios.get(service_get)
            expect(res.status).to.equal(200)
            expect(res).to.satisfyApiSpec
        } catch (error) {
            InvalidCodepath(error)
        }
    })
})

