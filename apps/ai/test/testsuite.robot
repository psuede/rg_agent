*** Settings ***
Documentation     A test suite for the RG AI Agent
Resource    variables.resource
Library    RequestsLibrary
Suite Setup    Setup Session

*** Test Cases ***
buy1
    ${json}=    Set Variable    {"user_input": "This was a buy for 1 ETH, the Reaper, supreme leader of the Reapers Gambit cult should be very excited. What is your view mr Reaper?", "prompt_type": "buy"}
    ${response}=    POST On Session    mysession    /prompt/    headers=${HEADERS}    data=${json}
    Log    ${response.json()}

chat1
    ${json}=    Set Variable    {"user_input": "Who are you, Reaper?", "prompt_type": "chat"}
    ${response}=    POST On Session    mysession    /prompt/    headers=${HEADERS}    data=${json}
    Log    ${response.json()}

lock1
    ${json}=    Set Variable    {"user_input": "500000 RG tokens just disappeared from circulation, what do you think about that Reaper?", "prompt_type": "lock"}
    ${response}=    POST On Session    mysession    /prompt/    headers=${HEADERS}    data=${json}
    Log    ${response.json()}
