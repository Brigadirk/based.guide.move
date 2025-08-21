"""Validation utilities leveraging the Pydantic schemas."""

# New schema-based validation using jsonschema

import json
from pathlib import Path

from jsonschema import Draft202012Validator, ValidationError

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "schemas" / "profile_schema.json"

with open(SCHEMA_PATH, "r", encoding="utf-8") as _f:
    _SCHEMA = json.load(_f)

_VALIDATOR = Draft202012Validator(_SCHEMA)

def validate_tax_data(data):
    """Validate incoming JSON using `TaxProfile`.

    Returns a dict compatible with the previous function signature so that the
    rest of the codebase does not need to change.
    """

    try:
        _VALIDATOR.validate(data)
        return {"valid": True, "message": "Data is valid"}
    except ValidationError as exc:
        return {"valid": False, "message": str(exc)}
