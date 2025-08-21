import json
from pathlib import Path

from modules.validator import validate_tax_data

ROOT = Path(__file__).resolve().parent.parent


def load_sample(name: str = "tax_migration_profile_test.json"):
    sample_path = ROOT / name
    with open(sample_path, encoding="utf-8") as f:
        return json.load(f)


def test_validator_accepts_valid_sample():
    data = load_sample()
    result = validate_tax_data(data)
    assert result["valid"] is True


def test_validator_rejects_missing_personal_information():
    data = load_sample()
    data.pop("personalInformation")
    result = validate_tax_data(data)
    assert result["valid"] is False
    assert "personalInformation" in result["message"]
