import json
from pathlib import Path

from modules.prompt_generator import generate_tax_prompt

ROOT = Path(__file__).resolve().parent.parent


def load_sample():
    with open(ROOT / "tax_migration_profile_test.json", encoding="utf-8") as f:
        return json.load(f)


def test_prompt_contains_usd_conversion():
    prompt = generate_tax_prompt(load_sample())
    assert "USD" in prompt  # converted amount appears
    assert "Annual Income:" in prompt
