let script_path = "/home/sevni/Documents/thclab/aries/agent-api-spec/swagger-spec.yaml"
const a1 = "http://localhost:8150"
const a2 = "http://localhost:8151"
const create_admin_inv = "/connections/create-admin-invitation-url"

const chai = require('chai')
const expect = chai.expect
const chaiResponseValidator = require('chai-openapi-response-validator')
const axios = require('axios')
const data = require('./data')
const InvalidCodepath = data.InvalidCodepath
const { assert } = require('chai')
chai.use(chaiResponseValidator(script_path))


describe("Services process", () => {
    let a1_admin_url = ""
    let a2_admin_url = ""
    it('Create admin URL', async () => {
        try {
            a1_admin_url = await axios.post(a1 + create_admin_inv)
            a1_admin_url = a1_admin_url.data['invitation_url']
            console.log(a1_admin_url)
        }
        catch (error) {
            InvalidCodepath(error, "Agent1")
        }
        try {
            a2_admin_url = await axios.post(a2 + create_admin_inv)
            a2_admin_url.data['invitation_url']
        }
        catch (error) {
            InvalidCodepath(error, "Agent2")
        }
    })
})