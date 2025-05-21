build-ui-js:
    ./libs/\
    -d:chronicles_enabled=off\
    -d:ctRenderer\
    -d:ctInExtension\
    --debugInfo:on\
    --lineDir:on\
    --hotCodeReloading:on\
    --out:%o\
    js %f |> %B.js