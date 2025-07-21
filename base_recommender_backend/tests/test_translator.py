import json
from pathlib import Path

from modules.translator import json_to_markdown

ROOT = Path(__file__).resolve().parent.parent


def load_sample():
    return json.loads((ROOT / "tax_migration_profile_test.json").read_text())


def test_every_key_present():
    data = load_sample()
    md = json_to_markdown(data)
    # ensure that a few representative keys appear
    assert "personalInformation" in md
    assert "incomeSources" in md
    assert "destinationCountry" in md 