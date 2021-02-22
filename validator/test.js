let script_path = "/home/sevni/Documents/thclab/aries/agent-api-spec/swagger-spec.yaml"
const a1 = "http://localhost:8150"
const a2 = "http://localhost:8151"

const chai = require('chai')
const expect = chai.expect
const chaiResponseValidator = require('chai-openapi-response-validator')
const axios = require('axios')
const data = require('./data')
chai.use(chaiResponseValidator(script_path))

function InvalidCodepath(response, message) {
    if (message == undefined) message = ""
    throw Error("Invalid Codepath " + message + response)
}


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
                /pds/
                expect(res.status).to.equal(422)
            })
    })
})
// let get_drivers = a1 + '/pds/drivers'
// describe(get_drivers, () => {
//     it('GET Registered Drivers', async () => {
//         const res = await axios.get(get_drivers)
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
// })
// let active_url = a1 + '/pds/active'
// describe(active_url, () => {
//     it('GET Active', async () => {
//         const res = await axios.get(active_url)
//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
// })
// let post_chunks = a1 + '/pds/oca-schema-chunks/'
// describe(post_chunks, () => {
//     it('POST OcaSchemaChunks', async () => {
//         let res
//         try {
//             res = await axios.post(post_chunks, data.oca_schema_chunks)
//         }
//         catch (err) { throw Error("Invalid response") }

//         expect(res.status).to.equal(200)
//         expect(res).to.satisfyApiSpec
//     })
//     let get_chunks = post_chunks + data.oca_schema_chunks_query
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

// oca_schema_chunks POST 200 OK
// oca_schema_chunks GET brak payload_dri
// 2. Zapytać się o format odpowiedzi GET oca_schema_chunks. Gdzie podać oca_schema_dri. Dri to nie to samo co oca_schema_dri
// 3. Jak powinna wyglądać odpowiedz na POST oca_schema_chunks. Aktualnie zwraca endpoint 200. Czy powinny tam być zamieszczone DRI?
// 9. Musimy dodac dodatkowy endpoint dla databat, own your data nie powinno miec required scope OK moze być opcjonalny scope. I dodatkowe oyd

// 11. Nie ma endpointu który wyciąga wszystkie instancje PDS. aktywny, drivery, driver1 - mojk twoj
// 8. POST settings -> Czy napewno dobry response? Pasowało by dodać informację na temat tego czy udało się połączyć! Aktualnie jest ArrayOfSettings 
    //  Robimy nie array tylko pojedyncze teraz