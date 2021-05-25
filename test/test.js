let script_path = "/home/sev/Work/agent-api-spec/swagger-spec.yaml"
const URL = require("./utils").URL
const Util = require("./utils").Util
const a = URL.agents


const chai = require('chai')
const expect = chai.expect
const chaiResponseValidator = require('chai-openapi-response-validator')
const axios = require('axios')
const data = require('./data')
const { assert } = require('chai')
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
// let post_chunks = a[0] + '/pds/oca-schema-chunks/'
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

// const save_url = a[0] + URL.pdsSave
// describe(save_url, () => {
//     it('POST GET Save', async () => {
//         try {
//             const payload = { "payload": "abc" }
//             const res = await Util.post(save_url, payload)
//             load_id = res.data['payload_id']
//             expect(res.status).to.equal(200)

//             let load_url = a[0] + `/pds/${load_id}`
//             const res2 = await axios.get(load_url)
//             expect(res2.status).to.equal(200)
//             expect(res2.data['payload']).to.eq(payload['payload'])
//         }
//         catch (error) { Util.InvalidCodepath(error) }
//     })
// })

// const consent_url = a[0] + '/consents'
// describe(consent_url, () => {
//     it('POST Consent', async () => {
//         const res = await axios.post(consent_url, data.consent)
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
//     it('GET Consent', async () => {
//         const res = await axios.get(consent_url)
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//         // console.log(res)
//     })
// })

// const services_consent_url = a[0] + '/consents'
// const services_url = a[0] + '/services'
// const servicesAdd_url = services_url + '/add'
// let added_service_id = undefined
// describe(services_consent_url, () => {
//     let consent_dri = ""
//     it("POST Consent for use in AddService", async function () {
//         const res = await axios.post(services_consent_url, data.consent)
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//         consent_dri = res.data['dri']
//     })

//     it('POST Add Service', async () => {
//         try {
//             const res = await axios.post(servicesAdd_url, {
//                 "consent_dri": consent_dri,
//                 "service_schema_dri": "3trgwgwfsv" + data.RandomNumber(),
//                 "label": "string"
//             })
//             added_service_id = res.data['service_id']
//             assert(added_service_id)
//             expect(res.status).to.equal(201)
//             expect(res).to.satisfyApiSpec
//         } catch (error) {
//             Util.InvalidCodepath(error)
//         }
//     })
// })

// describe(services_consent_url, () => {
//     it('GET Single service by id', async () => {
//         assert(added_service_id)
//         let service_get = services_url + '/' + added_service_id
//         try {
//             const res = await axios.get(service_get)
//             expect(res.status).to.equal(200)
//             expect(res).to.satisfyApiSpec
//         } catch (error) {
//             Util.InvalidCodepath(error)
//         }
//     })
//     it('GET All services', async () => {
//         assert(added_service_id)
//         let service_get = services_url
//         try {
//             const res = await axios.get(service_get)
//             expect(res.status).to.equal(200)
//             expect(res).to.satisfyApiSpec
//         } catch (error) {
//             Util.InvalidCodepath(error)
//         }
//     })
// })

