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

// # Process invite url, delete white spaces
// def processInviteUrl(url):
//     result = {}
//     url = url.replace(" ", "")
//     # Regex(substitution) to extract only the invite string from url
//     result["invite_string_b64"] = regex.sub(r".*(c\_i\=)", r"", url)
//     # Decoding invite string using base64 decoder
//     result["invite_string"] = base64.b64decode(result["invite_string_b64"])
//     # Converting our invite json string into a dictionary
//     result["invite"] = json.loads(result["invite_string"])
//     return result

function ProcessInviteURL(URL) {
    // Grab the query parameters
    index = URL.indexOf("?c_i=") + 5
    let substring = URL.substring(index)

    let content = new Buffer(substring, "base64").toString("ascii")
    content = JSON.parse(content)
    return content
}

describe("Services process", () => {
    let a1_admin_data = ""
    let a2_admin_data = ""
    it('Create admin URL', async () => {
        try {
            a1_admin_data = await axios.post(a1 + create_admin_inv)
            a1_admin_data = a1_admin_data.data['invitation_url']
            a1_admin_data = ProcessInviteURL(a1_admin_data)
        }
        catch (error) {
            InvalidCodepath(error, "Agent1")
        }
        try {
            a2_admin_data = await axios.post(a2 + create_admin_inv)
            a2_admin_data = a2_admin_data.data['invitation_url']
            a2_admin_data = ProcessInviteURL(a2_admin_data)
            console.log(a1_admin_data)
        }
        catch (error) {
            InvalidCodepath(error, "Agent2")
        }
    })
    it('Create admin URL', async () => {

        // 
        // console.log(a1_admin_data)
        // console.log(base.toString())
        // console.log(base)
    })
})