#!/usr/bin/env bash

if [ "$#" -eq 0 ]; then
  echo "Usage: $(basename $0) prompt_to_send_to_perplexity"
  echo ""
  echo " Requirements: jq must be installed, and PERPLEXITY_API defined"
  exit 1
fi

function p() {
  local json_request
  json_request=$(jq -n \
    --arg content "$*" \
    '{ 
      "model": "pplx-7b-online", 
      "messages": [ 
        { 
          "role": "system", 
          "content": "Be precise and concise." 
        }, 
        { 
          "role": "user", 
          "content": $content 
        } 
      ], 
      "stream": false 
    }')
  
  local json_response
  json_response=$(curl --silent \
    --request POST \
    --url https://api.perplexity.ai/chat/completions \
    --header 'accept: application/json' \
    --header "authorization: Bearer $PERPLEXITY_API" \
    --header 'content-type: application/json' \
    --data "$json_request")
  
  echo "$json_response" | jq --raw-output .choices.message.content
}

p "$*"
