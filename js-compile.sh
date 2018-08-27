#!/usr/bin/env bash

java -jar /home/m3ns1/dev/google-compiler/closure-compiler-v20180805.jar \
    --js_output_file=public/bin/panta.js \
    --language_in=ECMASCRIPT6 \
    --formatting=PRETTY_PRINT \
    'public/js/components/**.js' \
    'public/js/controllers/**.js' \
    'public/js/models/**.js' \
    'public/js/helpers/**.js' \
    'public/js/views/**.js'