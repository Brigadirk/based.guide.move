import pytest
import json
import requests
import argparse
import os
import sys
import glob

def parse_arguments():
    """Parse command line arguments to get the endpoint URL."""
    parser = argparse.ArgumentParser(description='Integration test for tax advice API endpoint')
    parser.add_argument('--endpoint', type=str, required=True, 
                        help='The full URL of the endpoint to test (e.g., http://localhost:5000/api/tax-advice)')
    return parser.parse_args()

def load_test_payloads():
    """
    Load all JSON test payloads from the payloads directory.
    Returns a dictionary of payload_name: payload_data
    """
    # Get the directory where the test script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the path to the payloads directory
    payloads_dir = os.path.join(script_dir, 'payloads')
    
    # Create the directory if it doesn't exist
    if not os.path.exists(payloads_dir):
        os.makedirs(payloads_dir)
        # Create a sample test payload if none exists
        create_sample_payloads(payloads_dir)
    
    # Get all JSON files from the directory
    json_files = glob.glob(os.path.join(payloads_dir, '*.json'))
    
    if not json_files:
        # Create sample payloads if no JSON files exist
        create_sample_payloads(payloads_dir)
        json_files = glob.glob(os.path.join(payloads_dir, '*.json'))
    
    # Load each JSON file into a dictionary
    payloads = {}
    for json_file in json_files:
        payload_name = os.path.basename(json_file).split('.')[0]
        try:
            with open(json_file, 'r') as f:
                payloads[payload_name] = json.load(f)
            print(f"✅ Loaded payload: {payload_name}")
        except json.JSONDecodeError as e:
            print(f"❌ Error loading {payload_name}: Invalid JSON format - {str(e)}")
        except Exception as e:
            print(f"❌ Error loading {payload_name}: {str(e)}")
    
    return payloads

def create_sample_payloads(payloads_dir):
    """Create sample test payload files in the payloads directory"""
    print("Creating sample payloads in the payloads directory...")
    
    # Standard valid payload
    standard_payload = {
        "individual": {
            "personalInformation": {
                "dateOfBirth": "1985-06-15",
                "nationalities": ["United States"],
                "maritalStatus": "Single",
                "currentResidency": {
                    "country": "United States",
                    "status": "Citizen",
                    "duration": 38.0,
                },
                "relocationPartner": False,
                "numRelocationDependents": 0,
            },
            "residencyIntentions": {
                "destinationCountry": {
                    "country": "Portugal",
                    "moveType": "Permanent",
                },
                "citizenshipPlans": {
                    "interestedInCitizenship": True,
                }
            },
            "finance": {
                "employment": {
                    "currentStatus": "Employed",
                    "industry": "Technology",
                },
                "income": {
                    "currency": "USD",
                    "annualAmount": 95000,
                }
            }
        }
    }
    
    # Minimal payload
    minimal_payload = {
        "individual": {
            "personalInformation": {
                "currentResidency": {
                    "country": "United States"
                }
            },
            "residencyIntentions": {
                "destinationCountry": {
                    "country": "Germany"
                }
            }
        }
    }
    
    # Empty payload for testing validation
    empty_payload = {}
    
    # Complex payload with all fields
    complex_payload = {
        "individual": {
            "personalInformation": {
                "dateOfBirth": "1985-01-15",
                "nationalities": ["United States"],
                "maritalStatus": "Married",
                "currentResidency": {
                    "country": "United States",
                    "status": "Citizen",
                    "duration": 40.0,
                },
                "relocationPartner": True,
                "relocationPartnerInfo": {
                    "relationshipType": "Spouse",
                    "partnerNationalities": ["United States"],
                },
                "numRelocationDependents": 2,
            },
            "residencyIntentions": {
                "destinationCountry": {
                    "country": "Portugal",
                    "moveType": "Permanent",
                },
                "citizenshipPlans": {
                    "interestedInCitizenship": True,
                },
                "languageProficiency": {
                    "individual": {"Portuguese": "Beginner"},
                    "willing_to_learn": ["Portuguese"]
                }
            },
            "finance": {
                "employment": {
                    "currentStatus": "Employed",
                    "industry": "Technology",
                },
                "income": {
                    "currency": "USD",
                    "annualAmount": 120000,
                },
                "assets": {
                    "realEstate": [
                        {
                            "country": "United States",
                            "type": "Primary Residence",
                            "value": 500000
                        }
                    ],
                    "financial": [
                        {
                            "type": "Stocks",
                            "value": 250000
                        }
                    ]
                }
            }
        }
    }
    
    # Write the sample payloads to files
    with open(os.path.join(payloads_dir, 'standard.json'), 'w') as f:
        json.dump(standard_payload, f, indent=4)
    
    with open(os.path.join(payloads_dir, 'minimal.json'), 'w') as f:
        json.dump(minimal_payload, f, indent=4)
    
    with open(os.path.join(payloads_dir, 'empty.json'), 'w') as f:
        json.dump(empty_payload, f, indent=4)
    
    with open(os.path.join(payloads_dir, 'complex.json'), 'w') as f:
        json.dump(complex_payload, f, indent=4)
    
    print("✅ Created sample payloads in the payloads directory")

def test_endpoint_receives_json(endpoint_url, payloads):
    """
    Test that the endpoint correctly:
    1. Receives JSON data
    2. Returns a 200 OK status code
    3. Returns a JSON response
    """
    # Use the standard payload for this test
    test_data = payloads.get('standard', payloads.get(list(payloads.keys())[0]))
    
    # Send POST request with JSON data
    response = requests.post(
        endpoint_url,
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    # Assert status code is 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Verify response is JSON
    assert 'application/json' in response.headers.get('Content-Type', ''), "Response is not JSON"
    
    # Parse the response data
    response_data = response.json()
    
    # Assert the response contains a status field
    assert 'status' in response_data, "Response does not contain 'status' field"
    
    print("✅ Endpoint successfully received JSON and returned a valid response")
    return True

def test_endpoint_handles_minimal_json(endpoint_url, payloads):
    """
    Test that the endpoint can handle a minimal JSON payload.
    """
    # Use the minimal payload for this test
    if 'minimal' not in payloads:
        print("⚠️ Minimal payload not found, skipping test")
        return True
    
    test_data = payloads['minimal']
    
    # Send POST request with minimal JSON
    response = requests.post(
        endpoint_url,
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    # Assert status code is 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    print("✅ Endpoint handled minimal JSON successfully")
    return True

def test_endpoint_handles_empty_json(endpoint_url, payloads):
    """
    Test that the endpoint properly handles empty JSON data.
    """
    # Use the empty payload for this test
    if 'empty' not in payloads:
        print("⚠️ Empty payload not found, skipping test")
        return True
    
    test_data = payloads['empty']
    
    # Send POST request with empty JSON
    response = requests.post(
        endpoint_url,
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    # Check if response is either 400 Bad Request or 200 OK depending on implementation
    assert response.status_code in [400, 200], f"Expected status code 400 or 200, got {response.status_code}"
    
    print(f"✅ Endpoint handled empty JSON with status code {response.status_code}")
    return True

def test_endpoint_handles_complex_json(endpoint_url, payloads):
    """
    Test that the endpoint can handle a complex JSON payload.
    """
    # Use the complex payload for this test
    if 'complex' not in payloads:
        print("⚠️ Complex payload not found, skipping test")
        return True
    
    test_data = payloads['complex']
    
    # Send POST request with complex JSON
    response = requests.post(
        endpoint_url,
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    # Assert status code is 200 OK
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    print("✅ Endpoint handled complex JSON successfully")
    return True

def test_endpoint_handles_invalid_content_type(endpoint_url):
    """
    Test that the endpoint properly handles requests with incorrect content type.
    """
    # Send POST request with text instead of JSON
    response = requests.post(
        endpoint_url,
        data="This is not JSON",
        headers={'Content-Type': 'text/plain'}
    )
    
    # Assert response is 400 Bad Request or 415 Unsupported Media Type
    assert response.status_code in [400, 415], f"Expected status code 400 or 415, got {response.status_code}"
    
    print(f"✅ Endpoint rejected invalid content type with status code {response.status_code}")
    return True

def main():
    """Main function to run the integration tests."""
    args = parse_arguments()
    endpoint_url = args.endpoint
    
    print(f"Running integration tests against endpoint: {endpoint_url}")
    print(f"Current date: Tuesday, April 15, 2025, 4:34 PM -05")
    
    # Load test payloads from the payloads directory
    payloads = load_test_payloads()
    
    if not payloads:
        print("❌ No valid payloads found. Tests cannot proceed.")
        sys.exit(1)
    
    # Run the tests
    try:
        test_endpoint_receives_json(endpoint_url, payloads)
        test_endpoint_handles_minimal_json(endpoint_url, payloads)
        test_endpoint_handles_empty_json(endpoint_url, payloads)
        test_endpoint_handles_complex_json(endpoint_url, payloads)
        test_endpoint_handles_invalid_content_type(endpoint_url)
        
        print("\n🎉 All tests passed successfully!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error running tests: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
