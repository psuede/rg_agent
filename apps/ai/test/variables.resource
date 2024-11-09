*** Variables ***
${BASE_URL}    http://localhost:8000
&{HEADERS}     Content-Type=application/json

*** Keywords ***
Setup Session
    Create Session    mysession    ${BASE_URL}
