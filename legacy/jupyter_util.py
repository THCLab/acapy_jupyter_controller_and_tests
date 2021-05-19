import aries_cloudagent.wallet.crypto as crypto
import requests
import base64
import base58
import json
import uuid
import regex


agent1 = "http://localhost:8150"
agent2 = "http://localhost:8151"


def save_to_pds(some_json):
    add = requests.post(agent1 + "/pds/save", json=some_json)
    assert_status_code_is_200(add)

    add = json.loads(add.text)
    return add


def save_to_pds2(some_json):
    add = requests.post(agent2 + "/pds/save", json=some_json)
    assert_status_code_is_200(add)

    add = json.loads(add.text)
    return add


def get_from_pds(some_id):
    get = requests.get(agent1 + "/pds/" + some_id)
    assert_status_code_is_200(get)

    get = json.loads(get.text)
    return get


def get_from_pds2(some_id):
    get = requests.get(agent1 + "/pds/" + some_id)
    assert_status_code_is_200(get)

    get = json.loads(get.text)
    return get


def save_and_retrieve(optional_test_string=""):
    payload = {"payload": "testing" + " " + optional_test_string}
    id = save_to_pds(payload)
    content = get_from_pds(str(id["payload_id"]))

    content.pop("success", None)
    assert (
        payload == content
    ), f"initial payload not equal to return value from pds {payload, content}"

    return id["payload_id"]


def get_pdses():
    get1 = requests.get(agent1 + "/pds")
    get2 = requests.get(agent2 + "/pds")

    assert get1.text != None and get2.text != None
    assert_status_code_is_200(get1)
    assert_status_code_is_200(get2)

    return [get1.text, get2.text]


def set_pds_config(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent1 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)

    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent2 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        assert_status_code_is_200(config)

    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_pds_config_agent1(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent1 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_pds_config_agent2(pds_type, settings={}, instance_name="default"):
    if settings != {}:
        settings.update({"optional_instance_name": instance_name})
        config = requests.post(
            agent2 + "/pds/settings",
            json={"settings": {pds_type: settings}},
        )
        print(config.text)
        assert_status_code_is_200(config)

    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def set_own_your_data():
    set_pds_config(
        "own_your_data",
        {
            "client_id": "GSM0HAaGVHrrcaUiiAufGWcuvpHOYG3mvwloWUcASzs",
            "client_secret": "cs1iLd7QUMtjFNYn0hToWXiBv0nquSJ-s5BUPyFRRDI",
            "api_url": "https://data-vault.eu",
        },
    )


def activate_pds_both_agents(pds_type, instance_name="default"):
    config = requests.post(
        agent1 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)
    config = requests.post(
        agent2 + "/pds/activate?type=" + pds_type + "&optional_name=" + instance_name
    )
    assert_status_code_is_200(config)


def assert_status_code_is_200(response_object):
    get = response_object
    if get.status_code != 200:
        print("status_code: " + str(get.status_code) + "  value: " + str(get.text))
        assert get.status_code == 200, "status_code is not 200"


localhost = "http://localhost"
from time import perf_counter
time_table = {}


def get_server_url():
    return localhost + ":"


def set_server_url(url):
    localhost = url
    
def add_time(port, url_end, start):
    total_time = perf_counter() - start 
    key = port + url_end
    
    find = key.find("?")
    if find != -1:
        key = key[:find]
            
    if time_table.get(key) == None:
        time_table[key] = []
    time_table[key].append(total_time)
    
def get_time_table():
    return time_table


def get(port, url_end) -> dict:
    start = perf_counter()
    port = str(port)
    request = requests.get(get_server_url() + port + url_end)
    assert_status_code_is_200(request)
    result = json.loads(request.text)
    add_time(port, url_end, start)
    return result


def post(port, url_end, json_dict=None) -> dict:
    start = perf_counter()
    port = str(port)
    if json_dict != None:
        request = requests.post(get_server_url() + port + url_end, json=json_dict)
    else:
        request = requests.post(get_server_url() + port + url_end)

    assert_status_code_is_200(request)
    result = json.loads(request.text)
    add_time(port, url_end, start)
    return result

def time_this(iterations, filename, function, reset_time_table=False):
    from time import perf_counter
    time_table = get_time_table()
    if reset_time_table:
        time_table={}
        
    time_table['total_time'] = []
    for i in range(iterations):
        start = perf_counter() 
        function()
        time_table['total_time'].append(perf_counter() - start)
        print(time_table['total_time'][i])
    with open(filename, 'w') as outfile:
        json.dump(time_table, outfile, sort_keys=True, indent=4)
        print("DONE!")
